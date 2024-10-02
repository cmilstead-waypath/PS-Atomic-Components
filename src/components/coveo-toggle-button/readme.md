# Coveo Toggle Button

`coveo-toggle-button` is a customizable button component for use with Coveo Atomic that allows users to expand or collapse content sections via toggling a class named `open`. This component provides a simple and accessible way to toggle the visibility of any target element within a specified container, with support for custom styling and various icon formats.

## Installation
You can install the component via npm:

```bash
npm install coveo-toggle-button
```

## Usage
To use the `coveo-toggle-button` component in your project, import it and include it in your HTML. Make sure to specify the appropriate attributes for customizing its behavior and appearance.

```html
<div class="my-container">
  <coveo-toggle-button
    label="Toggle details"
    button-class="custom-toggle"
    container-selector=".my-container"
    target-selector=".details"
    icon="▼">
  </coveo-toggle-button>
  <div class="details"></div>
</div>
```

<!-- Auto Generated Below -->


## Properties

| Property                         | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Type      | Default            |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| `buttonClass`                    | `button-class`       | A custom class to be applied to the button element. This allows users to add their own CSS styles to customize the button's appearance. Example: "my-custom-toggle-button"                                                                                                                                                                                                                                                                                                                                                      | `string`  | `''`               |
| `containerSelector` _(required)_ | `container-selector` | A CSS selector string for the container element that holds the target to be toggled. - If prefixed with `#`, it will be treated as an ID selector. - If prefixed with `.`, it will be treated as a class selector. - If no prefix is provided, it will first try to match an element by ID, and if none is found, it will attempt to match a class name.  Default: ".search-container"  Example: ".result-container", "#myContainer", "container"                                                                               | `string`  | `undefined`        |
| `icon` _(required)_              | `icon`               | Sets the icon to be displayed inside the button. - The icon can be any string, emoji, or character entity. - If provided as a URL (starting with `http://`, `https://`, `./`, `../`, or `/`), the button will fetch and display the SVG from that location. - If the icon is a stringified SVG (starts with `<svg`), it will be directly rendered within the button. Example: "▼", "►", `<svg ...>`, or a URL like "https://example.com/icon.svg"                                                                               | `string`  | `undefined`        |
| `isOpen`                         | `is-open`            | Defines the initial open state of the button and the target element. If true, the button and target element will be rendered with the "open" class. Example: true or false                                                                                                                                                                                                                                                                                                                                                      | `boolean` | `false`            |
| `label`                          | `label`              | Sets the accessible label for the button. This label is used for screen readers to describe the button's purpose. Example: "Toggle Details"                                                                                                                                                                                                                                                                                                                                                                                     | `string`  | `'Toggle Details'` |
| `targetSelector` _(required)_    | `target-selector`    | A CSS selector string for the target element within the container that will be toggled. - If prefixed with `#`, it will be treated as an ID selector. - If prefixed with `.`, it will be treated as a class selector. - If no prefix is provided, it will first try to match an element by ID within the container, and if none is found, it will attempt to match a class name.  When the button is clicked, the "open" class will be toggled on this target element.  Example: ".detail-wrapper", "#details", "detailWrapper" | `string`  | `undefined`        |


## Accessibility

* `aria-label`: The `label` property sets an accessible label for the button, making it easier for screen readers to describe the button's purpose.
* `aria-expanded`: The button dynamically toggles the `aria-expanded` attribute to indicate whether the target content is currently open or closed.
* **Keyboard Navigation**: The button can be toggled via the keyboard using the "Enter" or "Space" keys.

## Example

```html 
<div class="my-container">
  <coveo-toggle-button 
    label="Expand Section"
    button-class="custom-toggle"
    icon="https://example.com/my-icon.svg"
    container-selector=".my-container"
    target-selector=".section"
    is-open="true"
  ></coveo-toggle-button>
    <div class="section">
    <!-- The content to be shown/hidden on toggle -->
  </div>
</div>
```

In this example:
* The button uses a custom SVG icon from a URL.
* It applies a custom CSS class to the button for styling.
* It specifies a container and target element using container-selector and target-selector.
* The `is-open` property initializes the section in an open state.

## Customization & Theming

* Use the `buttonClass` property to apply your own styles to the button. The icon property allows for custom icons, including SVGs or text. By setting the containerSelector and targetSelector, you have complete control over what content is toggled.
----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
