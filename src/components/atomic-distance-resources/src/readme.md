# atomic-distance-resources

```
<atomic-distance-resources distance-field="distance"
                          geospatial-distances="[25, 50, 100, 200, 500]"
                          latitude-field="latitudeField"
                          longitude-field="longitudeField"
                          google-api-key="XXX"
                          panel-title="Distance"
></atomic-distance-resources>
```
 
The `atomic-distance-resources` component provides a flexible way to apply geospatial filtering to search results. It includes:

* **A distance field selector**: A customizable dropdown that allows users to choose a distance range from a set of predefined values (e.g., 25 miles, 50 miles, etc.). The distance options are easily customizable via a `geospatialDistances` property. **Note**: This field will only render if the `geospatialDistances` property is set.
* **A unit switcher**: Users can toggle between miles and kilometers for distance measurements.
* **A location input field**: An input box where users can enter a city name or postal code to set a new search position, providing a more precise geospatial filter. **Note**: This field will only render if the `googleApiKey` property is set. 
* **Shadow DOM** encapsulation for style and markup isolation.
* **Facet registration**: Implements registerFacet() and uses Atomic store to appear in the OOTB refine panel.

This component is ideal for enabling location-based searches and refining search results based on proximity to a specified location.

After a user allows geolocation on their browser, the latitude/longitude acquired from the navigator will be stored in a cookie called `lat_lgn` 

This component now supports Shadow DOM and can be rendered inside the out‑of‑the‑box <atomic-refine-toggle> (mobile "Filters" modal) by slott­ing it into the facets zone of your <atomic-search-interface>.

## Usage 

Place the component in your `atomic-facet-manager` to include it alongside other facets in both the desktop sidebar and the mobile refine modal:

```html
<atomic-search-interface> 
 <atomic-facet-manager>
    <!-- register your custom distance component as a facet -->
    <atomic-distance-resources
      distance-field="distance"
      geospatial-distances="[25, 50, 100, 200, 500]"
      latitude-field="latitudeField"
      longitude-field="longitudeField"
      google-api-key="YOUR_API_KEY"
      panel-title="Distance"
    ></atomic-distance-resources>
 
  <!-- additional facets -->
  <atomic-facet slot="facets" field="category" label="Category"></atomic-facet>
 </atomic-facet-manager>>

  <!-- toggle button for mobile filters -->
  <atomic-refine-toggle></atomic-refine-toggle>
  <!-- other status items -->
</atomic-search-interface>
```

<!-- Auto Generated Below -->

## Properties

| Property                           | Attribute              | Description                                                                                                                                             | Type                 | Default       |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------- |
| `defaultLatitude`                  | `default-latitude`     | The default latitude value to be used if no other location is provided.                                                                                 | `number`             | `33.9348279`  |
| `defaultLongitude`                 | `default-longitude`    | The default longitude value to be used if no other location is provided.                                                                                | `number`             | `-84.3546017` |
| `distanceField` _(required)_       | `distance-field`       | Specifies the name of the field in which to store the distance value.                                                                                   | `string`             | `undefined`   |
| `geospatialDistances` _(required)_ | `geospatial-distances` | The array of geospatial distances, as a string (e.g., `"[25, 50, 100]"`), which will be parsed and converted into options for the distance dropdown.    | `string \| string[]` | `undefined`   |
| `googleApiKey` _(required)_        | `google-api-key`       | A valid Google API key to be used for geocoding a city or postal code.                                                                                  | `string`             | `undefined`   |
| `isCollapsed`                      | `is-collapsed`         | Specifies whether the facet is collapsed. When the facet is the child of an `atomic-facet-manager` component, the facet manager controls this property. | `boolean`            | `false`       |
| `latitudeField` _(required)_       | `latitude-field`       | Specifies the name of the field that contains the latitude value.                                                                                       | `string`             | `undefined`   |
| `longitudeField` _(required)_      | `longitude-field`      | Specifies the name of the field that contains the longitude value.                                                                                      | `string`             | `undefined`   |
| `mobileBreakpoint`                 | `mobile-breakpoint`    | Mobile breakpoint at which the Apply button becomes visible                                                                                             | `string`             | `'640px'`     |
| `panelTitle`                       | `panel-title`          | The text that appears in the header.                                                                                                                    | `string`             | `'Distance'`  |
| `useNavigator`                     | `use-navigator`        | Whether to request the geolocation service of the web browser. If not defined, will not try to request the service. Defaults to `true`.                 | `boolean`            | `true`        |

## Shadow Parts

| Part                            | Description |
| ------------------------------- | ----------- |
| `"content"`                     |             |
| `"distance-selector"`           |             |
| `"distance-selector-container"` |             |
| `"distance-selector-wrapper"`   |             |
| `"error-message"`               |             |
| `"form-container"`              |             |
| `"from-box"`                    |             |
| `"km-input"`                    |             |
| `"km-label"`                    |             |
| `"label-button"`                |             |
| `"label-button-icon"`           |             |
| `"metric-container"`            |             |
| `"mile-input"`                  |             |
| `"mile-label"`                  |             |
| `"panel"`                       |             |
| `"postal-field-container"`      |             |
| `"postal-filter-input"`         |             |
| `"postal-submit-button"`        |             |


----------------------------------------------

Based on the functionality of the OOTB Coveo Distance Resources component in Coveo For Sitecore. For more information, see the official documentation: 
* [Coveo Distance Resources](https://docs.coveo.com/en/2272/coveo-for-sitecore-v5/coveo-distance-resources)
* [DistanceResources](https://coveo.github.io/search-ui/components/distanceresources.html)

*Built with [StencilJS](https://stenciljs.com/)*