import {Component, Prop, h, Element, State} from '@stencil/core';
import {resultContext} from '@coveo/atomic';
import {Result} from '@coveo/headless';

/**
 * Sample custom Atomic result component, to be used inside an Atomic Result Template.
 *
 * This component showcases a component that conditionally renders the author of a result, with a fallback to display "anonymous" in the event that no author is available for a document, for educational purposes.
 *
 * In a real life scenario, we recommend using [result-field-condition](https://docs.coveo.com/en/atomic/latest/reference/result-template-components/atomic-field-condition/) and [atomic-result-text](https://docs.coveo.com/en/atomic/latest/reference/result-template-components/atomic-result-text/).
 */
@Component({
  tag: 'facility-icon',
  styleUrl: 'facility-icon.css',
  shadow: false,
})
export class FacilityIcon {
  // The Headless result object to be resolved from the parent atomic-result component.
  @State() private result?: Result;
  @Element() private host!: Element;
  @Prop() field: string;

  // We recommended fetching the result context using the `connectedCallback` lifecycle method
  // with async/await. Using `componentWillLoad` will hang the parent `atomic-search-interface` initialization.
  public async connectedCallback() {
    try {
      this.result = await resultContext(this.host);
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

  public render() {
    // Do not render the component until the result object has been resolved.
    if (!this.result) {
      return;
    }

    if (!this.result.raw[this.field])
    {
      return <span class="search-result-icon default"></span>;
    }

    // Get the field value and normalize it
    const facilityIcon = this.result.raw[this.field].toString();

    // Replace spaces and pipe characters with dashes, then remove extra dashes
    const iconClass = facilityIcon
      .replace(/\s*\|\s*/g, '-')     // Replace pipe (|) with dash
      .replace(/\s*&\s*/g, '-')      // Replace ampersand (&) and surrounding spaces with dash
      .replace(/\s+/g, '-')          // Replace all other whitespace with dash
      .trim();

    const classes = `search-result-icon ${iconClass}`;
    return <span class={classes}></span>;
  }
}
