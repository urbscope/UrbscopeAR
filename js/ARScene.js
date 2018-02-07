'use strict';

import React,{
    View,
    Component
} from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroARScene,
  ViroAmbientLight,
} from 'react-viro';

import {
    _getModel,
    _onLoadStart,
    _onLoadEnd,
    _onArHitTestResults,
    _setInitialPlacement,
    _updateInitialRotation,
    _distance,
    _addARModeltoScene
} from './helpers/positioning_helpers';

import renderIf from "./helpers/renderIf";

export default class ARScene extends Component {

  constructor() {
    super();

    // Set initial state here
    this.state = {
        ARVisible: false,
        shouldBillboard : true,
    };

    //initialize AR modelArray and Node refs
    //AR Nodes will be stored as elements in this array. Mutated using addARModeltoScene and displayed with getModel
    this.modelArray = [];
    this.arNodeRefs = [];

    // bind 'this' to functions
    this._onSceneClicked = this._onSceneClicked.bind(this);
    this._getModel = _getModel.bind(this);
    this._addARModeltoScene = _addARModeltoScene.bind(this);
    this._onLoadStart = _onLoadStart.bind(this);
    this._onLoadEnd = _onLoadEnd.bind(this);
    this._onArHitTestResults = _onArHitTestResults.bind(this);
    this._setInitialPlacement = _setInitialPlacement.bind(this);
    this._updateInitialRotation = _updateInitialRotation.bind(this);
    this._distance = _distance.bind(this);

  }

  render() {
    return (
      <ViroARScene
          onTrackingInitialized={this.props.arSceneNavigator.viroAppProps._onTrackingInit}
          onClick={this._onSceneClicked}
          ref = {ref=>this.arScene= ref}>

          <ViroAmbientLight color="#ffffff" intensity={200}/>
          {this.modelArray}

      </ViroARScene>
    );
  }


    _onSceneClicked(){
        this.setState({
            ARVisible: false
        },()=>{
            this.props.arSceneNavigator.takeScreenshot("screenshot", true).then((res) => {
                console.log(res.success);
                console.log(res.url);
            }).then(() => {
                this._addARModeltoScene();
                this.setState({
                    ARVisible: true,
                });
            });
        });



    }

}

// var styles = StyleSheet.create({
//   helloWorldTextStyle: {
//     fontFamily: 'Arial',
//     fontSize: 30,
//     color: '#ffffff',
//     textAlignVertical: 'center',
//     textAlign: 'center',
//   },
// });
//
// ViroMaterials.createMaterials({
//   grid: {
//     diffuseTexture: require('./res/grid_bg.jpg'),
//   },
// });
//
// ViroAnimations.registerAnimations({
//   rotate: {
//     properties: {
//       rotateY: "+=90"
//     },
//     duration: 250, //.25 seconds
//   },
// });

module.exports = ARScene;
