import {Component, h, State, Prop, Element} from '@stencil/core';
import {resultContext} from '@coveo/atomic';
import {Result} from '@coveo/headless';

@Component({
  tag: 'toggle-button',
  styleUrl: 'toggle-button.css',
  shadow: false,
})
export class ToggleButton {
  // The Headless result object to be resolved from the parent atomic-result component.
  @State() private result?: Result;

  @Element() private host!: Element;

  /**
   * Sets the accessible label for the button.
   * This label is used for screen readers to describe the button's purpose.
   * Example: "Toggle Details"
   */
  @Prop() label: string = 'Toggle Details';

  /**
   * A custom class to be applied to the button element.
   * This allows users to add their own CSS styles to customize the button's appearance.
   * Example: "my-custom-toggle-button"
   */
  @Prop() buttonClass: string = '';
  /**
   * A CSS selector string for the container element that holds the target to be toggled.
   * - If prefixed with `#`, it will be treated as an ID selector.
   * - If prefixed with `.`, it will be treated as a class selector.
   * - If no prefix is provided, it will first try to match an element by ID, and if none is found, it will attempt to match a class name.
   * 
   * Default: ".search-container"
   * 
   * Example: ".result-container", "#myContainer", "container"
   */
  @Prop() containerSelector!: string;

  /**
   * A CSS selector string for the target element within the container that will be toggled.
   * - If prefixed with `#`, it will be treated as an ID selector.
   * - If prefixed with `.`, it will be treated as a class selector.
   * - If no prefix is provided, it will first try to match an element by ID within the container, and if none is found, it will attempt to match a class name.
   * 
   * When the button is clicked, the "open" class will be toggled on this target element.
   * 
   * Example: ".detail-wrapper", "#details", "detailWrapper"
   */
  @Prop() targetSelector!: string;
  /**
   * Defines the initial open state of the button and the target element.
   * If true, the button and target element will be rendered with the "open" class.
   * Example: true or false
   */
  @Prop({ reflect: true }) isOpen: boolean = false;

  /**
 * Sets the icon to be displayed inside the button.
 * - The icon can be any string, emoji, or character entity.
 * - If provided as a URL (starting with `http://`, `https://`, `./`, or `../`), the button will fetch and display the SVG from that location.
 * - If the icon is a stringified SVG (starts with `<svg`), it will be directly rendered within the button.
 * Example: "▼", "►", `<svg ...>`, or a URL like "https://example.com/icon.svg"
 */
  @Prop() icon!: string;

  // We recommended fetching the result context using the `connectedCallback` lifecycle method
  // with async/await. Using `componentWillLoad` will hang the parent `atomic-search-interface` initialization.
  public async connectedCallback() {
    try {
      this.result = await resultContext(this.host);
      await this.loadIcon();
    } catch (error) {
      console.error(error);
      this.host.remove();
    }
  }

   componentDidLoad() {
    const button = this.host.querySelector('button');
    if (button) {
      button.classList.toggle('open', this.isOpen);
     
      if ('ontouchstart' in window || navigator.maxTouchPoints) {
        button.addEventListener('touchstart', this.handleButtonClick.bind(this));
      } else {
        button.addEventListener('click', this.handleButtonClick.bind(this));
      }
    }
  }

  disconnectedCallback() {
    // Clean up event listener
    const button = this.host.querySelector('button');
    if (button) {
      button.removeEventListener('click', this.handleButtonClick.bind(this));
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    // Handle "Enter" or "Space" key to toggle open state
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleButtonClick();
    }
  }

  handleButtonClick() {
    // Determine whether containerSelector is an ID or class
    let containerElement;
    if (this.containerSelector.startsWith('#')) {
      // If it starts with '#', treat it as an ID
      containerElement = document.getElementById(this.containerSelector.substring(1));
    } else if (this.containerSelector.startsWith('.')) {
      // If it starts with '.', treat it as a class
      containerElement = this.host.closest(this.containerSelector) ||
        document.querySelector(this.containerSelector);
    } else {
      // If no prefix, try both ID and class
      containerElement = document.getElementById(this.containerSelector) ||
        this.host.closest(`.${this.containerSelector}`) ||
        document.querySelector(`.${this.containerSelector}`);
    }

    if (!containerElement) {
      console.warn(`Container element with selector "${this.containerSelector}" not found.`);
      return;
    }

    // Determine whether targetSelector is an ID or class
    let detailWrapper;
    if (this.targetSelector.startsWith('#')) {
      // If it starts with '#', treat it as an ID
      detailWrapper = containerElement.querySelector(this.targetSelector) ||
        document.getElementById(this.targetSelector.substring(1));
    } else if (this.targetSelector.startsWith('.')) {
      // If it starts with '.', treat it as a class
      detailWrapper = containerElement.querySelector(this.targetSelector);
    } else {
      // If no prefix, try both ID and class
      detailWrapper = containerElement.querySelector(`#${this.targetSelector}`) ||
        containerElement.querySelector(`.${this.targetSelector}`) ||
        document.getElementById(this.targetSelector);
    }

    if (detailWrapper) {
      // Toggle classes for both button and detail wrapper
      this.host.querySelector('button').classList.toggle('open');
      detailWrapper.classList.toggle('open');
    } else {
      console.warn(`Target element with selector "${this.targetSelector}" not found within container "${this.containerSelector}".`);
    }

    this.isOpen = !this.isOpen; // Keep track of open state
  }

  private async loadIcon(): Promise<string | HTMLElement> {
    // Check if the icon is a URL
    if (this.icon.startsWith('http://') || this.icon.startsWith('https://') || this.icon.startsWith('./') || this.icon.startsWith('../')) {
      try {
        // Fetch the SVG content from the provided URL
        const response = await fetch(this.icon);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }
        const svgString = await response.text();
        return svgString;
      } catch (error) {
        console.error('Error fetching SVG:', error);
        return this.icon; // Fallback to showing the icon string as plain text if the fetch fails
      }
    }
    // Check if the icon is a stringified SVG
    else if (this.icon.trim().startsWith('<svg')) {
      return this.icon;
    }
    // Return as plain text otherwise
    return this.icon;
  }

  // Utility method to ensure the target element has a unique ID for aria-controls
  private getTargetElementId(): string {

    let containerElement;
    if (this.containerSelector.startsWith('#')) {
      // If it starts with '#', treat it as an ID
      containerElement = document.getElementById(this.containerSelector.substring(1));
    } else if (this.containerSelector.startsWith('.')) {
      // If it starts with '.', treat it as a class
      containerElement = this.host.closest(this.containerSelector) ||
        document.querySelector(this.containerSelector);
    } else {
      // If no prefix, try both ID and class
      containerElement = document.getElementById(this.containerSelector) ||
        this.host.closest(`.${this.containerSelector}`) ||
        document.querySelector(`.${this.containerSelector}`);
    }

    if (!containerElement) {
      console.warn(`Container element with selector "${this.containerSelector}" not found.`);
      return;
    }

    // Determine whether targetSelector is an ID or class
    let targetElement;
    if (this.targetSelector.startsWith('#')) {
      // If it starts with '#', treat it as an ID
      targetElement = containerElement.querySelector(this.targetSelector) ||
        document.getElementById(this.targetSelector.substring(1));
    } else if (this.targetSelector.startsWith('.')) {
      // If it starts with '.', treat it as a class
      targetElement = containerElement.querySelector(this.targetSelector);
    } else {
      // If no prefix, try both ID and class
      targetElement = containerElement.querySelector(`#${this.targetSelector}`) ||
        containerElement.querySelector(`.${this.targetSelector}`) ||
        document.getElementById(this.targetSelector);
    }

    if (targetElement && !targetElement.id) {
      targetElement.id = `toggle-button-target-${Math.random().toString(36).substr(2, 9)}`;
    }
    return targetElement ? targetElement.id : '';
  }

  public render() {
    // Do not render the component until the result object has been resolved.
    if (!this.result) {
      return;
    }

    return (
      <button
        class={`${this.buttonClass}`}
        aria-label={`${this.label}`}
        aria-expanded={this.isOpen.toString()}
        aria-controls={this.getTargetElementId()}
      >{this.icon}</button>
    );
  }
}
