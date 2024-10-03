# atomic-distance-resources

```
<atomic-distance-resources distance-field="distance"
                          geospatial-distances="[25, 50, 100, 200, 500]"
                          latitude-field="latitudeField"
                          longitude-field="longitudeField"
                          google-api-key="XXX"
></atomic-distance-resources>
```
 
The `atomic-distance-resources` component provides a flexible way to apply geospatial filtering to search results. It includes:

* **A distance field selector**: A customizable dropdown that allows users to choose a distance range from a set of predefined values (e.g., 25 miles, 50 miles, etc.). The distance options are easily customizable via a `geospatialDistances` property. **Note**: This field will only render if the `geospatialDistances` property is set.
* **A unit switcher**: Users can toggle between miles and kilometers for distance measurements.
* **A location input field**: An input box where users can enter a city name or postal code to set a new search position, providing a more precise geospatial filter. **Note**: This field will only render if the `googleApiKey` property is set. 

This component is ideal for enabling location-based searches and refining search results based on proximity to a specified location.

After a user allows geolocation on their browser, the latitude/longitude acquired from the navigator will be stored in a cookie called `lat_lgn` 

<!-- Auto Generated Below -->

## Properties

| Property                           | Attribute              | Description                                                                                                                                          | Type                 | Default       |
| ---------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------- |
| `defaultLatitude`                  | `default-latitude`     | The default latitude value to be used if no other location is provided.                                                                              | `number`             | `33.9348279`  |
| `defaultLongitude`                 | `default-longitude`    | The default longitude value to be used if no other location is provided.                                                                             | `number`             | `-84.3546017` |
| `distanceField` _(required)_       | `distance-field`       | Specifies the name of the field in which to store the distance value.                                                                                | `string`             | `undefined`   |
| `geospatialDistances` _(required)_ | `geospatial-distances` | The array of geospatial distances, as a string (e.g., `"[25, 50, 100]"`), which will be parsed and converted into options for the distance dropdown. | `string \| string[]` | `undefined`   |
| `googleApiKey` _(required)_        | `google-api-key`       | A valid Google API key to be used for geocoding a city or postal code.                                                                               | `string`             | `undefined`   |
| `latitudeField` _(required)_       | `latitude-field`       | Specifies the name of the field that contains the latitude value.                                                                                    | `string`             | `undefined`   |
| `longitudeField` _(required)_      | `longitude-field`      | Specifies the name of the field that contains the longitude value.                                                                                   | `string`             | `undefined`   |
| `useNavigator`                     | `use-navigator`        | Whether to request the geolocation service of the web browser. If not defined, will not try to request the service. Defaults to `true`.              | `boolean`            | `true`        |


----------------------------------------------

Based on the functionality of the OOTB Coveo Distance Resources component in Coveo For Sitecore. For more information, see the official documentation: 
* [Coveo Distance Resources](https://docs.coveo.com/en/2272/coveo-for-sitecore-v5/coveo-distance-resources)
* [DistanceResources](https://coveo.github.io/search-ui/components/distanceresources.html)

*Built with [StencilJS](https://stenciljs.com/)*