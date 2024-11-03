# ICBM Calculator

Tools used to test theories and math behind the ICBM mod for Minecraft

Live Version: [Github Pages](https://darkguardsman.com/icbm-calculator-web/)

## Local Setup

To run locally install node.js and npm. Guides for how to do this can be found easily online.

Once setup the application can be cloned via a git tool. Then started using `npm run start`.

## Tech Stack

* React (CRA) - for its web components, mostly out of familiarity then any specific reason
* Typescript - better detection of mismatching data during development
* JS Canvas - simplicity in getting simulation data render

## Design

Idea is to build a series of pages dedicated to areas of usage. In a way that keeps things a mix of generic and focused. For example, blast caluations in Minecraft happen in a 3D map. Yet the are nothing more than world interactions with metadata. So a page can be created to represent this as a map with simple tools to generate tiles. Then additional tools to select the test to run with customization options as desired.