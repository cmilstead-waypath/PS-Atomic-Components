# atomic-icon-facet

A custom Coveo Atomic facet component that mirrors the behavior and styling of the v2 `atomic-facet`, but renders an icon next to each facet value and **omits** the built-in facet search box. It fully supports checkbox, link and box display modes, collapsible headers, clear-filters action, show more/less buttons, and integrates seamlessly with the Atomic facet-manager and refine-modal.

```
<atomic-icon-facet field="FIELD-NAME" 
                  label="LABEL-TEXT" 
                  sort-criteria="alphanumeric">
</atomic-icon-facet>
```
---

## Features

- **Iconified values**: apply a CSS class `facet-icon-{value}` to render an icon next to each label. Includes a custom Shadow DOM part 'value-icon-[FACET VALUE TEXT]' to allow custom styling for each icon.  
- **Three display modes**: checkbox, link or box, just like v2 Atomic facets  
- **Collapsible header** with toggle arrow and clear filters button  
- **Show more / show less** controls for paginated facets  
- **Seamless integration** with Coveo Headless & Atomic v2 search engine bindings  
- **Facet-manager & refine-modal** ready: registers itself for breadcrumb and mobile refine toggles  
- **Lightweight**: no facet search UI, for scenarios where you only need iconified filtering  

---
## Installation
```bash 

npm install atomic-icon-facet
```

---

## Usage
```html
<atomic-search-interface>
  
  <!-- checkbox mode (default) -->
  <atomic-icon-facet
    field="facilityType"
    label="Facility Type"
    number-of-values="8"
    sort-criteria="automatic"
    injection-depth="1000"
    filter-facet-count="true"
    heading-level="2">
  </atomic-icon-facet>

  <!-- link mode -->
  <atomic-icon-facet
    field="category"
    label="Category"
    display-values-as="link"
    number-of-values="5"
    heading-level="3">
  </atomic-icon-facet>

  <!-- box mode -->
  <atomic-icon-facet
    field="status"
    label="Status"
    display-values-as="box"
    number-of-values="6">
  </atomic-icon-facet>

</atomic-search-interface>

```


<!-- Auto Generated Below -->


## Properties

| Property             | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type                                                        | Default       |
| -------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- |
| `allowedValues`      | `allowed-values`     | Specifies an explicit list of `allowedValues` in the Search API request, as a JSON string representation.  If you specify a list of values for this option, the facet uses only these values (if they are available in the current result set).  Example:  The following facet only uses the `Contact`, `Account`, and `File` values of the `objecttype` field. Even if the current result set contains other `objecttype` values, such as `Message`, or `Product`, the facet does not use those other values.  ```html <atomic-facet field="objecttype" allowed-values='["Contact","Account","File"]'></atomic-facet> ```  The maximum amount of allowed values is 25.  Default value is `undefined`, and the facet uses all available values for its `field` in the current result set. | `string \| string[]`                                        | `'[]'`        |
| `dependsOn`          | --                   | The required facets and values for this facet to be displayed. Examples: ```html <atomic-facet facet-id="abc" field="objecttype" ...></atomic-facet>  <!-- To show the facet when any value is selected in the facet with id "abc": --> <atomic-facet   depends-on-abc   ... ></atomic-facet>  <!-- To show the facet when value "doc" is selected in the facet with id "abc": --> <atomic-facet   depends-on-abc="doc"   ... ></atomic-facet> ```                                                                                                                                                                                                                                                                                                                                        | `{ [x: string]: string; }`                                  | `{}`          |
| `displayValuesAs`    | `display-values-as`  | Whether to display the facet values as checkboxes (multiple selection), links (single selection) or boxes (multiple selection). Possible values are 'checkbox', 'link', and 'box'.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `"box" \| "checkbox" \| "link"`                             | `'checkbox'`  |
| `enableExclusion`    | `enable-exclusion`   | Whether to allow excluding values from the facet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `boolean`                                                   | `false`       |
| `facetId`            | `facet-id`           | Specifies a unique identifier for the facet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `string`                                                    | `undefined`   |
| `field` _(required)_ | `field`              | The field whose values you want to display in the facet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `string`                                                    | `undefined`   |
| `filterFacetCount`   | `filter-facet-count` | Whether to exclude the parents of folded results when estimating the result count for each facet value.   Note: Resulting count is only an estimation, in some cases this value could be incorrect.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `boolean`                                                   | `true`        |
| `headingLevel`       | `heading-level`      | The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading over the facet, from 1 to 6.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `number`                                                    | `0`           |
| `injectionDepth`     | `injection-depth`    | The maximum number of results to scan in the index to ensure that the facet lists all potential facet values. Note: A high injectionDepth may negatively impact the facet request performance. Minimum: `0` Default: `1000`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `number`                                                    | `1000`        |
| `isCollapsed`        | `is-collapsed`       | Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                   | `false`       |
| `label`              | `label`              | The non-localized label for the facet. Used in the `atomic-breadbox` component through the bindings store.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `string`                                                    | `'no-label'`  |
| `numberOfValues`     | `number-of-values`   | The number of values to request for this facet. Also determines the number of additional values to request each time more values are shown.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `number`                                                    | `8`           |
| `sortCriteria`       | `sort-criteria`      | The sort criterion to apply to the returned facet values. Possible values are 'score', 'alphanumeric',  'occurrences',  'score' and 'automatic'.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `"alphanumeric" \| "automatic" \| "occurrences" \| "score"` | `'automatic'` |


## CSS Custom Properties

You can control your icon size via CSS variables:

```css
atomic-icon-facet {
  --atomic-facet-icon-width: 24px;
  --atomic-facet-icon-height: 24px;
}
```

You can also control the gap between the icon and the label text, depending on the display mode you choose:

```css
atomic-icon-facet {
 --atomic-facet-icon-label-gap: 0.5rem; /* Gap between icon and label text. display-values-as="checkbox" */
  --atomic-facet-icon-text-gap: 0px; /* Gap between icon and label text. display-values-as="box | link"*/
}
```

## Shadow Parts

This component exposes the same ::part() slots as the v2 atomic-facet, plus your icon span:

| Part                        | Description                                                                     |
| --------------------------- | --------------------------------------------------------------------------------|
| `"clear-button"`            | The button that resets the actively selected facet values                       |
| `"clear-button-icon"`       | The clear button icon.                                                          |
| `"facet"`                   | The wrapper for the entire facet.                                               |
| `"label-button"`            | The button that displays the label and allows to expand/collapse the facet.     |
| `"label-button-icon"`       | The label button icon.                                                          |
| `"show-less"`               | The show less results button.                                                   |
| `"show-more"`               | The show more results button.                                                   |
| `"show-more-less-icon"`     | The icons of the show more & show less buttons.                                 |
| `"value-box"`               | The facet value when display is 'box'.                                          |
| `"value-checkbox-label"`    | The facet value checkbox clickable label, available when display is 'checkbox'. |
| `"value-icon-[FACET VALUE]"`| The facet value icon, unique to each facet value.                               |
| `"value-count"`             | The facet value count, common for all displays.                                 |
| `"value-label"`             | The facet value label, common for all displays.                                 |
| `"value-link"`              | The facet value when display is 'link'.                                         |
| `"values"`                  | The facet values container.                                                     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
