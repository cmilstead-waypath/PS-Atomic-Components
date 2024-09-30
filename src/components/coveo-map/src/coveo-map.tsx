import { Component, Element, h, Prop, State, forceUpdate } from '@stencil/core';
import { Bindings, initializeBindings } from '@coveo/atomic';
import { ResultList, ResultListState, SearchStatusState, buildSearchStatus, buildResultList, SearchEngine, Unsubscribe } from '@coveo/headless';
import { Loader } from '@googlemaps/js-api-loader';

@Component({
  tag: 'coveo-map',
  styleUrl: 'coveo-map.css',
  shadow: false,
})
export class CoveoMap {

  // The Atomic bindings to be resolved on the parent atomic-search-interface.
  // Used to access the Headless engine in order to create controllers, dispatch actions, access state, etc.
  private bindings?: Bindings

  // We recommend recording possible errors thrown during the configuration.
  private error?: Error;

  // Headless controller that contains the necessary methods.
  private resultsListController!: ResultList;

  // When disconnecting components from the page, we recommend removing
  // state change listeners as well by calling the unsubscribe methods.
  private resultsListUnsubscribe: Unsubscribe = () => { };
  private statusUnsubscribe: Unsubscribe = () => { };
  private i18nUnsubscribe = () => { };
  
  // Headless controller state property, using the `@State()` decorator.
  // Headless will automatically update these objects when the state related
  // to the controller has changed.
  @State() private resultsListState!: ResultListState;
  @State() private statusState!: SearchStatusState;
  @State() includedFields: string[] = [];
  @State() searchEngine!: SearchEngine; // Assume this is passed down from atomic-search-interface

  @Element() private host!: Element;

  /**
 * The SVG icon to use for a custom pin icon.
 *
 * - Use a value that starts with `http://`, `https://`, `./`, or `../` to fetch and display an icon from a given location.
 * - Use a stringified SVG to display it directly.
 */
  @Prop() pinIcon: string;
  /**
 * The SVG icon used for the custom pin icon's hover state, replacing the `pinIcon` content on `mouseenter`.
 *
 * - Use a value that starts with `http://`, `https://`, `./`, or `../` to fetch and display the icon from an external location.
 * - Use a stringified SVG to render it directly.
 * 
 * Note: This icon will only be rendered if `pinIcon` is also set.
 */
  @Prop() hoverPinIcon: string;
  /**
 * A URL pointing to a template file for customizing the content of the info window.
 *
 * - Use a value that starts with `http://`, `https://`, `./`, or `../` to fetch the template from a given location.
 * - The template can contain placeholders in the format `{{field}}`, which will be replaced with corresponding data values from the `result.raw` array .
 * - Conditional blocks can be included using `{{#if field}}...{{/if}}` to render content only if the field is present.
 *
 * Example: <div class="title">{{title}}
 */
  @Prop() infoWindowTemplateUrl: string;
  /**
  * A valid Google API key to be used for rendering the Google Map.
  */
  @Prop() googleApiKey!: string;
  /**
   * Allows the user to set the initial center of the map.
   *
   * Expect a JSON string for { lat: number, lng: number }
   *
   * Default: { lat: 0, lng: 0 }
   */
  @Prop() mapCenter: string; 
  /**
   * Allows the user to set the initial zoom level of the map.
  */
  @Prop() initialZoom: number = 8;
  /**
   * Sets the minimum zoom level. Default: 2
   */
  @Prop() minZoom: number = 2;
  /**
   * Sets teh maximum zoom level. Default: 15
   */
  @Prop() maxZoom: number = 15;
  /**
   * Allows users to enable or disable the zoom control.
   */
  @Prop() zoomControl: boolean = true;
  /**
   * Controls whether the Street View control is visible.
   */
  @Prop() streetViewControl: boolean = true;
  /**
   * Enables or disables zooming via the scroll wheel.
   */
  @Prop() scrollwheel: boolean = false;
  /**
   * Defines how the map handles gestures like zooming and panning.
   * 
   * Type: "none" | "greedy" | "cooperative" | "auto"
   */
  @Prop() gestureHandling: "none" | "greedy" | "cooperative" | "auto" = "cooperative";
  /**
   * Allows the user to specify a Google Maps Map ID for custom map styling.
   */
  @Prop() mapId: string = "";
  /**
   * Sets the maximum width of the InfoWindow.
   */
  @Prop() infoWindowMaxWidth: number = 300;
  /**
   * Controls whether the map automatically pans to the info window.
   */
  @Prop() disableInfoWindowAutoPan: boolean = false;
  /**
* Specifies the name of the field that contains the latitude value.
*/
  @Prop() latitudeField!: string;
  /**
* Specifies the name of the field that contains the longitude value.
*/
  @Prop() longitudeField!: string;
  /**
   * A list of non-default fields to include in the query results. Specify the property as an array using a JSON string representation:
   * 
   *  <coveo-map fields-to-include='["fieldA", "fieldB"]'></coveo-map>
   */
  @Prop() fieldsToInclude: string[] | string;

  // Declare the markers array to keep track of all markers on the map.
  private markers: google.maps.marker.AdvancedMarkerElement[] = [];
  private map?: google.maps.Map;
  private bounds?: google.maps.LatLngBounds;
  private infoWindow: google.maps.InfoWindow;
  private parsedMapCenter: { lat: number; lng: number } = { lat: 0, lng: 0 };

  // We recommend initializing the bindings and the Headless controllers
  // using the `connectedCallback` lifecycle method with async/await.
  // Using `componentWillLoad` will hang the parent atomic-search-interface initialization.
  public async connectedCallback() {
    try {
      // Wait for the Atomic to load.
      await customElements.whenDefined('atomic-search-interface');
      // Wait for the Atomic bindings to be resolved.
      this.bindings = await initializeBindings(this.host);
     
      // Initialize controllers.
      const statusController = buildSearchStatus(this.bindings.engine);

      // Subscribe to controller state changes.
      this.statusUnsubscribe = statusController.subscribe(
        () => (this.statusState = statusController.state)
      );

      this.registerIncludedFields();

      this.resultsListController = buildResultList(this.bindings.engine, {
        options: { fieldsToInclude: this.includedFields },
      });

      this.resultsListUnsubscribe = this.resultsListController.subscribe(
        () => (this.resultsListState = this.resultsListController.state,
          this.initializeMapData())
      );

      // (Optional) To use if component needs to rerender when the Atomic i18n language changes.
      // If your component does not use any strings or does not support multiple languages,
      // you can ignore everything related to i18n.
      const updateLanguage = () => forceUpdate(this);
      this.bindings.i18n.on('languageChanged', updateLanguage);
      this.i18nUnsubscribe = () =>
        this.bindings.i18n.off('languageChanged', updateLanguage);
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  componentDidLoad() {
    if (this.mapCenter) {
      this.parsedMapCenter = JSON.parse(this.mapCenter);
    }

    // Create a new div element for the map
    const mapDiv = document.createElement('div');
    mapDiv.id = 'map';
    // Append the new div to the host element
    this.host.shadowRoot?.appendChild(mapDiv) ?? this.host.appendChild(mapDiv);

    const loader = new Loader({
      apiKey: this.googleApiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loader.load().then(() => {
      this.initializeMap();
    }).catch(error => {
      console.error("Failed to load Google Maps:", error);
      // Handle error state appropriately.
      this.error = error as Error;
    });
  }

  // The `disconnectedCallback` lifecycle method should be used to unsubcribe controllers
  public disconnectedCallback() {
    this.resultsListUnsubscribe();
    this.statusUnsubscribe();
    this.i18nUnsubscribe();
  }

  private initializeMap() {

    try {
      // Ensures your component or a child div has a defined height, or the map won't display.
      const mapDiv = this.host.shadowRoot?.querySelector('#map') ?? this.host?.querySelector("#map");

      if (mapDiv instanceof HTMLElement) {
        this.map = new google.maps.Map(mapDiv, {
          center: new google.maps.LatLng(this.parsedMapCenter.lat, this.parsedMapCenter.lng),
          zoom: this.initialZoom,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          zoomControl: this.zoomControl,
          streetViewControl: this.streetViewControl,
          scrollwheel: this.scrollwheel,
          gestureHandling: this.gestureHandling,
          mapId: this.mapId,
        });

        this.infoWindow = new google.maps.InfoWindow({
          content: '',
          disableAutoPan: this.disableInfoWindowAutoPan,
          maxWidth: this.infoWindowMaxWidth,
        });

        //Disable the default header on info box
        this.infoWindow.setHeaderDisabled(true);

      } else
        console.error('Failed to initialize Google Maps: Map container element not found.');
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  private initializeMapData() {
    try {
      if (!this.map) return;

      // Clear existing markers
      this.markers.forEach(marker => {
        marker.map = null; // Removes the marker from the map
      });
      this.markers = [];

      this.bounds = new google.maps.LatLngBounds();

      this.resultsListController.state.results.forEach((result) => {
        const latitude = result.raw[this.latitudeField] as number;
        const longitude = result.raw[this.longitudeField] as number;

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const position = new google.maps.LatLng(latitude, longitude);

          // Extend the bounds to include this position
          this.bounds.extend(position);
          var title = result.raw.title;
          var pos = new google.maps.LatLng(latitude, longitude);

          // Use the content as needed, e.g., for an info window
          var markerDataItem = {
            title: title,
            position: pos
          };

          this.addMarker(markerDataItem, result);       
        }
        else {
          console.error("Failed to set Google Maps markers: latitude/longitude fields were not found.")
        }
      });

      // Adjust the map view so that all markers are visible within the viewport
      this.map.fitBounds(this.bounds);

    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  //private addMarker(obj) {
  //  try {
  //    var content = "<div id=\"pin-details\">",
  //      infoBubbleTitle = `<div class=\"title\"><h1>${obj.title}</h1></div>`,
  //      infoBubbleAddress = '',
  //      infoBubbleCategories = '',
  //      infoBubblePhone = '',
  //      infoBubbleDirections = obj.directionUri;

  //    if (!obj.address?.includes("<div class=\"address\">")) {
  //      var address = `<div class="address">${obj.address}</div>`;
  //      infoBubbleAddress = address;
  //    } else {
  //      infoBubbleAddress = obj.address;
  //    }

  //    if (obj.categories[1] || obj.categories[2]) {
  //      infoBubbleCategories = `<div class="categories">`;
  //      if (obj.categories[1]) {
  //        for (var i = 0; i < obj.categories[1].length; i++)
  //          infoBubbleCategories += `<h4>${obj.categories[1][i]}</h4>`;
  //      }
  //      if (obj.categories[2]) {
  //        for (var i = 0; i < obj.categories[2].length; i++)
  //          infoBubbleCategories += `<h4>${obj.categories[2][i]}</h4>`;
  //      }
  //      infoBubbleCategories += '</div>';
  //    }

  //    if (obj.phone)
  //      infoBubblePhone = `<a class="phone" href="tel:${obj.phone}">${obj.phone}</a>`;

  //    content += infoBubbleTitle;

  //    if (obj.showAddress == 1) content += infoBubbleAddress;
  //    if (infoBubbleCategories != '') content += infoBubbleCategories;
  //    if (infoBubblePhone != '') content += infoBubblePhone;
  //    if (obj.showAddress == 1) content += infoBubbleDirections;
  //    content += "</div>";

  //    //// Assuming nMarker is the marker number, which we want to use as a glyph
  //    //const pinView = new google.maps.marker.PinElement({
  //    //  //glyph: nMarker.toString(),  // Use the marker number or any glyph you want
  //    //  glyphColor: 'white',        // Set the color of the text or glyph
  //    //  background: '#FF0000',      // Customize the background color (or set it to match your SVG color)
  //    //  scale: 1.5                  // Adjust the scale for the size
  //    //});

  //    // Create an HTML element that contains the SVG
  //    const defaultMarker = document.createElement('div');
  //    defaultMarker.innerHTML = `<img src="/public/westrock/images/locations-map-marker.svg" width="26" height="42" />`;

  //    const hoverMarker = document.createElement('div');
  //    hoverMarker.innerHTML = `<img src="/public/westrock/images/locations-map-marker-hover.svg" width="26" height="42" />`;


  //    // Create the AdvancedMarkerElement with the default marker
  //    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
  //      position: obj.position,
  //      map: this.map,
  //      title: obj.title,
  //      gmpClickable: true,
  //      content: defaultMarker, // Set default marker content
  //    });

  //    // Add event listeners to the default marker DOM element
  //    defaultMarker.addEventListener('mouseenter', () => {
  //      advancedMarker.content = hoverMarker;  // Set the hover state content
  //    });

  //    defaultMarker.addEventListener('mouseleave', () => {
  //      advancedMarker.content = defaultMarker;  // Revert to default marker
  //    });

  //    hoverMarker.addEventListener('mouseleave', () => {
  //      advancedMarker.content = defaultMarker;
  //    });

  //    // Marker click listener
  //    advancedMarker.addListener('click', () => {
  //      const isMobile: boolean = window.screen.availWidth < 768;
  //      if (isMobile) {
  //        const locationModal: HTMLElement | null = document.getElementById('location-pin-details-modal');
  //        if (locationModal) {
  //          locationModal.classList.add('open');
  //          const contentContainer: Element | null = locationModal.querySelector('.content');
  //          if (contentContainer) {
  //            contentContainer.innerHTML = content;
  //            // Select any link within the content and blur it to remove focus
  //            const link = contentContainer.querySelector('a');
  //            if (link) {
  //              link.blur();
  //            }
  //          }
  //        }
  //      } else {
  //        this.infoWindow.setContent(content);
  //        this.infoWindow.open(this.map, advancedMarker);
  //        this.map.panTo(advancedMarker.position);
  //        this.map.setCenter(advancedMarker.position);

  //        //blur the first 'a' element
  //        const pinDetails: HTMLElement | null = document.getElementById('pin-details');
  //        if (pinDetails) {
  //          const link: HTMLElement | null = pinDetails.querySelector('a');
  //          if (link) {
  //            link.blur();
  //          }
  //        }
  //      }
  //    });

  //    this.map.addListener('click', () => {
  //      if (window.screen.availWidth >= 768) {
  //        this.infoWindow.close();
  //        this.map.setCenter(this.bounds.getCenter());
  //        this.map.fitBounds(this.bounds);
  //      }
  //    });

  //    this.markers.push(advancedMarker);
  //  } catch (error) {
  //    console.error(error);
  //    this.error = error as Error;
  //  }
  //}

  private async addMarker(obj, result) {
    try {
     
      let advancedMarker;
      let defaultMarker;
      let hoverMarker;

      // Check if the pinIcon is provided to customize marker appearance
      if (this.pinIcon) {
        // Create the marker icon element from the pinIcon URL
        defaultMarker = await this.createSVGMarkerContent(this.pinIcon);

        // Initialize the AdvancedMarkerElement with the default marker icon
        advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          position: obj.position,
          map: this.map,
          title: obj.title,
          gmpClickable: true,
          content: defaultMarker,
        });

        // If a hover icon is provided, set up hover functionality
        if (this.hoverPinIcon) {
          hoverMarker = await this.createSVGMarkerContent(this.hoverPinIcon);

          // Switch content on mouseenter and mouseleave for hover effect
          defaultMarker.addEventListener('mouseenter', () => {
            advancedMarker.content = hoverMarker; // Set hover state content
          });

          defaultMarker.addEventListener('mouseleave', () => {
            advancedMarker.content = defaultMarker; // Revert to default marker
          });

          hoverMarker.addEventListener('mouseleave', () => {
            advancedMarker.content = defaultMarker;
          });
        }
      } else {
        // Default AdvancedMarkerElement without custom icons
        advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          position: obj.position,
          map: this.map,
          title: obj.title,
          gmpClickable: true,
        });
      }

      // Add a click event listener to the marker
      advancedMarker.addListener('click', async () => {
        const windowContent = await this.createInfoWindowContent(result);
        const isMobile: boolean = window.screen.availWidth < 768;
        if (isMobile) {
          const locationModal: HTMLElement | null = document.getElementById('location-pin-details-modal');
          if (locationModal) {
            locationModal.classList.add('open');
            const contentContainer: Element | null = locationModal.querySelector('.content');
            if (contentContainer) {
              contentContainer.innerHTML = windowContent;
              // Select any link within the content and blur it to remove focus
              const link = contentContainer.querySelector('a');
              if (link) {
                link.blur();
              }
            }

            // Add click event listeners to close the modal when clicking on the overlay or close button
            const modalOverlay: HTMLElement | null = locationModal.querySelector('.modal-overlay');
            const closeModalButton: HTMLElement | null = locationModal.querySelector('a.close-modal');

            const closeModal = () => {
              locationModal.classList.remove('open');
            };

            // Close when clicking on the overlay
            if (modalOverlay) {
              modalOverlay.addEventListener('click', closeModal);
            }

            // Close when clicking on the close button
            if (closeModalButton) {
              closeModalButton.addEventListener('click', closeModal);
            }
          }
        } else {
          this.infoWindow.setContent(windowContent);
          this.infoWindow.open(this.map, advancedMarker);
          this.map.panTo(advancedMarker.position);
          this.map.setCenter(advancedMarker.position);

          //blur the first 'a' element
          const pinDetails: HTMLElement | null = document.getElementById('pin-details');
          if (pinDetails) {
            const link: HTMLElement | null = pinDetails.querySelector('a');
            if (link) {
              link.blur();
            }
          }
        }
      });

      // Handle click events on the map to close the infoWindow
      this.map.addListener('click', () => {
        if (window.screen.availWidth >= 768) {
          this.infoWindow.close();
          this.map.setCenter(this.bounds.getCenter());
          this.map.fitBounds(this.bounds);
        }
      });

      // Store the marker for future reference or cleanup
      this.markers.push(advancedMarker);
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }

  private registerIncludedFields() {
    if (typeof this.fieldsToInclude === 'string') {
      try {
        // Try parsing the string as JSON
        this.includedFields = JSON.parse(this.fieldsToInclude);

        // Ensure that it's an array after parsing
        if (!Array.isArray(this.includedFields)) {
          console.error('fields-to-include must be an array or a valid JSON array string.');
          this.includedFields = [];
        }
      } catch (e) {
        console.error('Failed to parse fields-to-include as JSON:', e);
        this.includedFields = [];
      }
    } else if (Array.isArray(this.fieldsToInclude)) {
      // If it's already an array, just assign it
      this.includedFields = this.fieldsToInclude;
    } else {
      console.error('fields-to-include must be either a string or an array.');
      this.includedFields = [];
    }
  }

  private replacePlaceholders(template: string, result: any): string {
    // Use the `raw` property of the result for data
    const data = result.raw;

    // Handle conditionals: {{#if field}}...{{/if}}
    const conditionalRegex = /{{#if (.*?)}}(.*?){{\/if}}/gs;
    template = template.replace(conditionalRegex, (_, field, content) => {
      const fieldTrimmed = field.trim();
      const value = data[fieldTrimmed];
      // If the field exists and is not empty, keep the content; otherwise, remove it
      return value !== undefined && value !== null && value !== '' ? content : '';
    });

    // Handle array iterations: {{#each array}}...{{/each}}
    const eachRegex = /{{#each (.*?)}}(.*?){{\/each}}/gs;
    template = template.replace(eachRegex, (_, arrayField, arrayContent) => {
      const arrayFieldTrimmed = arrayField.trim();
      const arrayValue = data[arrayFieldTrimmed];
      // If the field is an array, iterate and build the content
      if (Array.isArray(arrayValue) && arrayValue.length > 0) {
        return arrayValue.map(item => arrayContent.replace(/{{this}}/g, item)).join('');
      }
      return ''; // Return empty if not an array or array is empty
    });

    // Handle simple placeholders: {{field}}
    const placeholderRegex = /{{(.*?)}}/g;
    template = template.replace(placeholderRegex, (_, field) => {
      const fieldTrimmed = field.trim();
      const value = data[fieldTrimmed];
      // Replace with field value if available, or keep the placeholder empty
      return value !== undefined && value !== null ? value : '';
    });

    return template;
  }

  private async createInfoWindowContent(markerDataItem: any): Promise<string> {
    let templateContent = '';

    if (this.infoWindowTemplateUrl) {
      try {
        const response = await fetch(this.infoWindowTemplateUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        templateContent = await response.text();
        // Replace placeholders using `result.raw`
        templateContent = this.replacePlaceholders(templateContent, markerDataItem);
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    } else {
      // Fallback to default content if no template URL is provided
      templateContent = `
      <div>
        <h1>${markerDataItem.title}</h1>      
      </div>
    `;
    }

    return templateContent;
  }

  private async createSVGMarkerContent(icon: string): Promise<HTMLElement> {
    const markerDiv = document.createElement('div');

    try {
      // Check if the icon is a valid URL (starts with http://, https://, ./, or ../)
      if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('./') || icon.startsWith('../')) {
        // Fetch the SVG content from the URL
        const response = await fetch(icon);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }
        // Get the SVG content as text
        const svgString = await response.text();
        markerDiv.innerHTML = svgString;
      }
      // If the icon is a stringified SVG, use it directly
      else if (icon.trim().startsWith('<svg')) {
        markerDiv.innerHTML = icon;
      }
      // Handle other cases (invalid format)
      else {
        throw new Error('Invalid icon format. Must be a valid URL, assets path, or SVG string.');
      }
    } catch (error) {
      console.error('Error fetching or setting SVG:', error);
      // Optionally, set a fallback SVG or display an error
      markerDiv.innerHTML = '<!-- SVG could not be loaded -->';
    }

    return markerDiv;
  }

  render() {
    if (this.error) {
      return (
        <atomic-component-error element={this.host} error={this.error}></atomic-component-error>
      );
    }

    if (!this.bindings || !this.statusState.hasResults || !this.resultsListState.hasResults) {
      return;
    }

    return (
      <div id="location-pin-details-modal">
        <div class="modal-overlay"></div>
        <div class="modal-dialog">
          <span class="close-button">
            <a class="close-modal" aria-label="Close" tabindex="0">
              <span class="close-icon">
                <svg width="0" height="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g fill-rule="evenodd">
                    <path d="M4 6.182L6.182 4 20 17.818 17.818 20z"></path>
                    <path d="M20 6.182L6.182 20 4 17.818 17.818 4z"></path>
                  </g>
                </svg>
              </span>
            </a>
          </span>
          <div class="content">
          </div>
        </div>
      </div>
    );
  }
}
