import React, { Component } from 'react';
import {
    AppRegistry,
    ActivityIndicator,
    Text,
    View,
    StyleSheet,
    TouchableHighlight,
    Image,
    Alert,
} from 'react-native';

import {
    ViroARSceneNavigator
} from 'react-viro';


import renderIf from './js/helpers/renderIf';
var InitialARScene = require('./js/ARScene');

// Array of 3d models that we use in this app.
var objArray = [
    require('./js/res/emoji_smile/emoji_smile.vrx')];

export default class Urbscope extends Component {
    constructor() {
        super();

        this._renderTrackingText = this._renderTrackingText.bind(this);
        this._onTrackingInit = this._onTrackingInit.bind(this);
        this._onLoadStart = this._onLoadStart.bind(this);
        this._onLoadEnd = this._onLoadEnd.bind(this);

        this.state = {
            viroAppProps: {objectSource: objArray[0], _onLoadEnd: this._onLoadEnd, _onLoadStart: this._onLoadStart, _onTrackingInit:this._onTrackingInit},
            trackingInitialized: false,
            isLoading: false,
        }
    }

    render() {
        return (
            <View style={localStyles.outer} >
                <ViroARSceneNavigator style={localStyles.arView} apiKey="C934C47E-DF38-490B-AD3A-0288BC7C702B"
                                      initialScene={{scene:InitialARScene}}  viroAppProps={this.state.viroAppProps} />
                {this._renderTrackingText()}

                {renderIf(this.state.isLoading,
                    <View style={{position:'absolute', left:0, right:0, top:0, bottom:0, alignItems: 'center', justifyContent:'center'}}>
                        <ActivityIndicator size='large' animating={this.state.isLoading} color='#ffffff'/>
                    </View>)
                }

            </View>
        );
    }

    // Invoked when a model has started to load, we show a loading indictator.
    _onLoadStart() {
        this.setState({
            isLoading: true,
        });
    }

    // Invoked when a model has loaded, we hide the loading indictator.
    _onLoadEnd() {
        this.setState({
            isLoading: false,
        });
    }

    _renderTrackingText() {
        if(this.state.trackingInitialized) {
            return null;
        } else {
            return (<View style={{position: 'absolute', backgroundColor:"#ffffff22", left: 30, right: 30, top:30, alignItems: 'center'}}>
                <Text style={{fontSize:12, color:"#ffffff"}}>Waiting for tracking to initialize.</Text>
            </View>);
        }
    }

    _onTrackingInit() {
        this.setState({
            trackingInitialized: true,
        });
    }

}

var localStyles = StyleSheet.create({
    outer : {
        flex : 1,
    },

    arView: {
        flex:1,
    },

    buttons : {
        height: 80,
        width: 80,
        paddingTop:20,
        paddingBottom:20,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor:'#00000000',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffffff00',
    }
});

module.exports = Urbscope;
