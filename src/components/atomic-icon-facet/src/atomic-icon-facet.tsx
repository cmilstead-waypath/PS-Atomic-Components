import { Component, Prop, State, Element, h, forceUpdate, Host } from '@stencil/core';
import { initializeBindings, Bindings } from '@coveo/atomic';
import {
  buildFacet,
  Facet,
  FacetState,
  FacetValue,
  FacetSortCriterion,
  FacetOptions,
  FacetConditionsManager,
  SearchStatusState,
  buildSearchStatus,
  Unsubscribe
} from '@coveo/headless';
import { FacetInfo } from '@coveo/atomic/dist/types/components/common/facets/facet-common-store';
import { ArrayProp, MapProp } from '@coveo/atomic/dist/types/utils/props-utils';

@Component({
  tag: 'atomic-icon-facet',
  styleUrl: 'atomic-icon-facet.css',
  shadow: true, // or true, if you prefer Shadow DOM
})
export class AtomicIconFacet {
  /**
 * A facet is a list of values for a certain field occurring in the results, ordered using a configurable criteria (e.g., number of occurrences).
 * An `atomic-facet` displays a facet of the results for the current query.
 *
 * @part facet - The wrapper for the entire facet.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-icon-[VALUE TEXT] - The facet value icon, unique to each facet value.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-link - The facet value when display is 'link'.
 * @part value-link-selected - The selected facet value when display is 'link'.
 * @part value-box - The facet value when display is 'box'.
 * @part value-box-selected - The selected facet value when display is 'box'.
 * @part value-exclude-button - The button to exclude a facet value, available when display is 'checkbox'.
 *
 * @part show-more - The show more results button.
 * @part show-less - The show less results button.
 * @part show-more-less-icon - The icons of the show more & show less buttons.
 */
  /**
  * Specifies a unique identifier for the facet.
  */
  @Prop({ mutable: true, reflect: true }) public facetId?: string;
  /**
   * The non-localized label for the facet.
   * Used in the `atomic-breadbox` component through the bindings store.
   */
  @Prop({ reflect: true }) public label = 'no-label';
  /**
   * The field whose values you want to display in the facet.
   */
  @Prop({ reflect: true }) public field!: string;
  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time more values are shown.
   */
  @Prop({ reflect: true }) public numberOfValues = 8;
  /**
   * The sort criterion to apply to the returned facet values.
   * Possible values are 'score', 'alphanumeric',  'occurrences',  'score' and 'automatic'.
   */
  @Prop({ reflect: true }) public sortCriteria: FacetSortCriterion = 'automatic';
  /**
   * Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection).
   * Possible values are 'checkbox', 'link', and 'box'.
   */
  @Prop({ reflect: true }) public displayValuesAs: 'checkbox' | 'link' | 'box' = 'checkbox';
  /**
   * Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.
   */
  @Prop({ reflect: true, mutable: true }) public isCollapsed = false;
  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.
   */
  @Prop({ reflect: true }) public headingLevel = 0;
  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   */
  @Prop({ reflect: true }) public filterFacetCount = true;
  /**
   * Whether to allow excluding values from the facet.
   */
  @Prop({ reflect: true }) public enableExclusion = false;
  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   * Note: A high injectionDepth may negatively impact the facet request performance.
   * Minimum: `0`
   * Default: `1000`
   */
  @Prop() public injectionDepth = 1000;
  /**
   * Specifies an explicit list of `allowedValues` in the Search API request, as a JSON string representation.
   *
   * If you specify a list of values for this option, the facet uses only these values (if they are available in
   * the current result set).
   *
   * Example:
   *
   * The following facet only uses the `Contact`, `Account`, and `File` values of the `objecttype` field. Even if the
   * current result set contains other `objecttype` values, such as `Message`, or `Product`, the facet does not use
   * those other values.
   *
   * ```html
   * <atomic-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-facet>
   * ```
   *
   * The maximum amount of allowed values is 25.
   *
   * Default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  @ArrayProp()
  @Prop({ mutable: true })
  public allowedValues: string[] | string = '[]';
  /**
 * The required facets and values for this facet to be displayed.
 * Examples:
 * ```html
 * <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>
 *
 * <!-- To show the facet when any value is selected in the facet with id "abc": -->
 * <atomic-facet
 *   depends-on-abc
 *   ...
 * ></atomic-facet>
 *
 * <!-- To show the facet when value "doc" is selected in the facet with id "abc": -->
 * <atomic-facet
 *   depends-on-abc="doc"
 *   ...
 * ></atomic-facet>
 * ```
 */
  @MapProp() @Prop() public dependsOn: Record<string, string> = {};

  /** Facet’s Headless state (values + selected states) */
  @State() private facetState!: FacetState;
  /** SearchStatus to know when results exist */
  @State() private searchStatusState!: SearchStatusState;

  private facetController!: Facet;
  private facetConditionsManager?: FacetConditionsManager;
  private bindings!: Bindings;
  private facetUnsubscribe: Unsubscribe = () => { };
  private statusUnsubscribe: Unsubscribe = () => { };
  private i18nUnsubscribe = () => { };
  private error?: Error;
  private facetRegistered = false;

  /** Returns the number of values whose state === "selected" */
  private get facetCount(): number {
    if (!this.facetState || !this.facetState.values) {
      return 0;
    }
    return this.facetState.values.filter((v) => v.state === 'selected').length;
  }

  // inside AtomicIconFacet class:
  private get facetInfo(): FacetInfo {
    return {
      facetId: this.facetId!,
      element: this.host,
      label: () => this.bindings.i18n.t(this.label as any)
    };
  }

  public get labelValue() {
    return this.label;
  }

  public hasActiveValues() {
    return this.facetController?.state?.values?.some((v) => v.state === 'selected') ?? false;
  }

  public numberOfSelectedValues() {
    return this.facetController?.state?.values?.filter((v) => v.state === 'selected').length ?? 0;
  }

  @Element() private host!: HTMLElement;

  async connectedCallback() {
    try {
      if (!this.field) {
        console.error('<atomic-icon-facet> missing required `field` attribute');
        return;
      }

      // Wait for the Atomic search interface to exist
      await customElements.whenDefined('atomic-search-interface');
      // Then initialize the Atomic “bindings” (engine + i18n, etc.)
      this.bindings = await initializeBindings(this.host);

      // 1) Build the Headless facet controller with our options
      this.facetController = buildFacet(this.bindings.engine, { options: this.facetOptions });
      this.facetId = this.facetController.state.facetId;

      // 2) Build a SearchStatus controller so we know when a first result set is returned
      const statusController = buildSearchStatus(this.bindings.engine);
      this.statusUnsubscribe = statusController.subscribe(() => {
        this.searchStatusState = statusController.state;
      });

      this.facetState = this.facetController.state;
      this.facetUnsubscribe = this.facetController.subscribe(() => {
        this.facetState = this.facetController.state
      });

      this.registerFacet();

      // 3) Re‐render on language change (i18n)
      const updateLanguage = () => forceUpdate(this);
      this.bindings.i18n.on('languageChanged', updateLanguage);
      this.i18nUnsubscribe = () => this.bindings.i18n.off('languageChanged', updateLanguage);
    } catch (e) {
      this.error = e as Error;
      console.error('Error initializing <atomic-icon-facet>:', e);
    }
  }

  disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.statusUnsubscribe();
    this.facetUnsubscribe();
    this.i18nUnsubscribe();
    this.facetConditionsManager?.stopWatching();
  }

  private registerFacet() {
    if (this.facetRegistered) {
      return;
    }
    this.bindings.store.registerFacet('facets', this.facetInfo);
    this.facetRegistered = true;
  }

  private get facetOptions(): FacetOptions {
    const opts: FacetOptions = {
      facetId: this.facetId,
      field: this.field,
      numberOfValues: this.numberOfValues,
      sortCriteria: this.sortCriteria,
      injectionDepth: this.injectionDepth,
      filterFacetCount: this.filterFacetCount,
      hasBreadcrumbs: true,
      // don’t mention allowedValues here at all if it’s empty
    };

    // If you want to support allowed-values:
    if (
      Array.isArray(this.allowedValues) &&
      this.allowedValues.length > 0
    ) {
      opts.allowedValues = this.allowedValues;
    }

    return opts;
  }

  /** Flip the local “collapsed” boolean (Headless v2 has no toggleCollapse()) */
  private toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  private toggleSelection(value: FacetValue) {
    this.facetController.toggleSelect(value);
  }

  private renderFacetHeader() {
    const Tag =
      this.headingLevel >= 1 && this.headingLevel <= 6
        ? (`h${this.headingLevel}` as any)
        : 'div';

    // plain chevron pointing down
    const chevronSvg =
      '<svg viewBox="0 0 12.6 7.2" xmlns="http://www.w3.org/2000/svg"><path d="m11.3 7.04c-.3 0-.5-.1-.7-.3l-4.6-4.6-4.6 4.6c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l5.2-5.2c.4-.4 1.2-.4 1.6 0l5.2 5.2c.4.4.4 1 0 1.4-.2.2-.4.3-.7.3"/></svg>';

    return (
      <button
        class="btn-text-transparent flex font-bold justify-between w-full py-1 px-2 text-lg rounded-none ripple-parent ripple-relative"
        part="label-button"
        title={
          this.isCollapsed
            ? `Expand the ${this.label} facet`
            : `Collapse the ${this.label} facet`
        }
        aria-expanded={!this.isCollapsed}
        onClick={() => this.toggleCollapse()}
      >
        <Tag class="truncate">{this.label}</Tag>
        <atomic-icon
          part="label-button-icon"
          class={{
            'w-3 self-center shrink-0 ml-4 hydrated ripple-relative': true,
            // rotate the chevron 180° when collapsed
            'rotate-180': this.isCollapsed,
          }}
          icon={chevronSvg}
          aria-hidden="true"
        ></atomic-icon>
      </button>
    );
  }

  private renderClearLinkIfNeeded() {
    const xSvg = `<svg viewBox="0 0 22 22""><g transform="matrix(.7071 -.7071 .7071 .7071 -3.142 11)""><path d="m9-3.4h2v26.9h-2z"/><path d="m-3.4 9h26.9v2h-26.9z"/></g></svg>`
    // Find out if any facet-value is currently selected:
    const hasAnySelected = this.facetState.values.some(v => v.state === 'selected');
    if (!hasAnySelected) {
      return null;
    }
    return (
      <button
        class="btn-text-primary flex items-baseline max-w-full p-2 text-sm ripple-parent ripple-relative"
        part="clear-button"
        onClick={() => this.facetController.deselectAll()}
        aria-label={`Clear ${this.facetCount} filter for the ${this.label} facet`}
      >
        <atomic-icon
          part="clear-button-icon"
          class="w-2 h-2 mr-1 hydrated ripple-relative"
          icon={xSvg}>
        </atomic-icon>
        <span class="ripple-relative">Clear filter</span>
      </button>
    );
  }

  private renderFacetValue(value: FacetValue) {
    const raw = value.value.trim();
    const iconClass = raw
      .replace(/&/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-_]/g, '');

    const isChecked = value.state === 'selected';
    const caption = this.bindings.i18n.t(
      value.value,               // key
      value.value,               // default fallback
      { ns: `caption-${this.field}` } // options
    );

    const count = value.numberOfResults.toLocaleString(this.bindings.i18n.language);

    // Shared aria‐label
    const ariaLabel = `Inclusion filter on ${caption}; ${count} result${count !== '1' ? 's' : ''}`;

    // Shared key/id
    const id = `facet-value-${iconClass}`;

    switch (this.displayValuesAs) {
      case 'link':
        return (
          <li key={value.value}>
            <button
              id={id}
              part="value-link"
              class="btn-text-neutral group w-full flex items-center px-2 py-2.5 text-left truncate no-outline ripple-parent ripple-relative"
              role="button"
              aria-pressed={isChecked.toString()}
              aria-label={ariaLabel}
              onClick={() => this.toggleSelection(value)}
            >
              <span class={`facet-icon ${iconClass}`} part={`value-icon-${iconClass}`} aria-hidden="true" />
              <span
                title={caption}
                part="value-label"
                class="value-label truncate group-hover:text-primary group-focus:text-primary ripple-relative"
              >
                {caption}
              </span>
              <span part="value-count" class="value-count ripple-relative">
                ({count})
              </span>
            </button>
          </li>
        );

      case 'box':
        return (
          <li key={value.value}>
            <button
              id={id}
              part="value-box"
              class={{
                'btn-outline-bg-neutral value-box box-border w-full h-full items-center p-2 group ripple-parent ripple-relative': true,
                selected: isChecked,
              }}
              role="button"
              aria-pressed={isChecked.toString()}
              aria-label={ariaLabel}
              onClick={() => this.toggleSelection(value)}
            >
              <span class={`facet-icon ${iconClass}`} part={`value-icon-${iconClass}`} aria-hidden="true" />
              <span
                title={caption}
                part="value-label"
                class="value-label truncate group-hover:text-primary group-focus:text-primary ripple-relative"
              >
                {caption}
              </span>
              <span
                title={count}
                part="value-count"
                class="value-box-count text-neutral-dark truncate w-full text-sm mt-1 ripple-relative"
              >
                ({count})
              </span>
            </button>
          </li>
        );

      case 'checkbox':
      default:
        // your existing checkbox code, rendered inside a <li>
        return (
          <li key={value.value} class="relative flex items-center">
            <button
              id={id}
              class={{
                'w-4 h-4 grid place-items-center rounded no-outline hover:border-primary-light focus-visible:border-primary-light value-checkbox': true,
                'border border-neutral-dark': !isChecked,
                'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light': isChecked,
              }}
              part={`value-checkbox${isChecked ? ' value-checkbox-checked' : ''}`}
              role="checkbox"
              aria-checked={isChecked.toString()}
              aria-label={ariaLabel}
              onClick={() => this.toggleSelection(value)}
            >
              <atomic-icon
                class={{
                  'w-3/5 svg-checkbox hydrated block': isChecked,
                  hidden: !isChecked,
                }}
                icon={`<svg viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 5L4.6 7.99999L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                aria-hidden="true"
              />
            </button>
            <label
              htmlFor={id}
              part="value-checkbox-label"
              class={{
                'group items-center': true,
                'value-selected': isChecked,
              }}
              aria-hidden="true"
            >
              <span class={`facet-icon ${iconClass}`} part={`value-icon-${iconClass}`} aria-hidden="true" />
              <span
                title={caption}
                part="value-label"
                class="value-label truncate group-hover:text-primary group-focus:text-primary"
              >
                {caption}
              </span>
              <span part="value-count" class="value-count">
                ({count})
              </span>
            </label>
          </li>
        );
    }
  }

  private showMore() {
    this.facetController.showMoreValues();
  }

  private showLess() {
    this.facetController.showLessValues();
  }

  private renderShowMoreLess() {
    const plusSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M496 208H304V16h-96v192H16v96h192v192h96V304h192"/></svg>`;
    const minusSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m64 208h384v96h-384z"/></svg>`;

    return (
      <div class="show-more-less">
        {this.facetState.canShowLessValues && (
          <button class="btn-text-primary flex items-baseline text-left p-2 text-sm max-w-full ripple-parent ripple-relative" part="show-less" onClick={() => this.showLess()} aria-label={`Show less values for the ${this.label} facet`}>
            <atomic-icon icon={minusSvg} aria-hidden="true" part="show-more-less-icon" class="w-2 h-2 mr-1 hydrated ripple-relative"></atomic-icon>
            <span class="truncate ripple-relative">Show less</span>
          </button>
        )}
        {this.facetState.canShowMoreValues && (
          <button class="btn-text-primary flex items-baseline text-left p-2 text-sm max-w-full ripple-parent ripple-relative" part="show-more" onClick={() => this.showMore()} aria-label={`Show more values for the ${this.label} facet`}>
            <atomic-icon icon={plusSvg} aria-hidden="true" part="show-more-less-icon" class="w-2 h-2 mr-1 hydrated ripple-relative"></atomic-icon>
            <span class="truncate ripple-relative">Show more</span>
          </button>
        )}
      </div>
    );
  }

  render() {
    if (this.error) {
      return (
        <atomic-component-error element={this.host} error={this.error}></atomic-component-error>
      );
    }

    if (!this.bindings || !this.searchStatusState?.hasResults) {
      return;
    }

    const values = this.facetState.values || [];
    return (
      <Host>
        <div part="facet" class="bg-background border border-neutral rounded-lg p-4">
          {this.renderFacetHeader()}
          {this.renderClearLinkIfNeeded()}
          <fieldset
            class="contents"
            style={{ display: this.isCollapsed ? 'none' : 'block' }}>
            <legend class="accessibility-only">Values for the {this.label} facet</legend>
            <ul class={{ "mt-3": true, "box-container": this.displayValuesAs == "box" }} part="values">
              {values.length
                ? values.map(v => this.renderFacetValue(v))
                : [<li>(no values)</li>]}
            </ul>
            {this.renderShowMoreLess()}
          </fieldset>
        </div>
      </Host>
    );
  }
}
