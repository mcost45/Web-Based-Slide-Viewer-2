# Viewer2

This project was created to develop Angular (+ Material, NgRx, e2e Testing & OpenSeadragon) skills. It is based off the function of [a previous technical challenge where only pure JS + no imports were allowed](https://github.com/mcost45/Web-Based-Slide-Viewer).

### Component Overview

App Component<br/>
&nbsp;&nbsp;--- Page Content Component<br/>
&nbsp;&nbsp;&nbsp;&nbsp;--- Loading Card Component<br/>
&nbsp;&nbsp;&nbsp;&nbsp;--- Viewer Settings Component<br/>
&nbsp;&nbsp;&nbsp;&nbsp;--- View Component<br/>

The loading card component displays the progress spinner as the default .vmic is loaded. The viewer settings component displays sliders to ajust the filters on the OpenSeadragon canvas. The view component contains the OpenSeadragon wrapper, and contains the bulk of the typescript.

### The View Component

Initially, the viewer component will use JSZip to asynchronously load the default .vmic file, next it also unzips the inner Image/.vmici file. Then all the tiles stored within the dzc_output folder are loaded as blobs, these blobs are each generated into object URLS, and finally stored in an array, accessibile as array \[level\]\[x\]\[y\]. Next the dzc_output XML file is processed using XMLJS. Finally the processed values from the XML are used to initiate OpenSeadragon, with its tile source linked to the blob URLs array.

## Generated by Angular:

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.1.2.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run# `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
