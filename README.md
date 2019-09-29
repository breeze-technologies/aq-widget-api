# AQ Widget API server

This is the API server that serves the AQ Widget (see `aq-widget-app` repository) with air quality data. 

The server uses the EEA AQ client (see `aq-client-eea` repository) for continuously downloading recent air quality data from the European Environment Agency. It uses the OpenStreetMap Nominatim service for reverse-geocoding station coordinates to station address information.

## Widget usage instructions

If you want to embed the AQ Widget in your website, please have a look at the `README` file in the `aq-widget-app` repository.

## Run instructions

For running the API server, we recommend using a Docker container that bundles the different widget modules. For details, please have a look at the `README` file in the `aq-widget-devops` repository.

---

Licensed under the EUPL.