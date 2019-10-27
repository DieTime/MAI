import 'core-js/features/map';
import 'core-js/features/set';
import React from 'react';
import ReactDOM from 'react-dom';
import connect from '@vkontakte/vk-connect';
import {Provider} from 'react-redux'
import reducer from './reducers'
import {createStore} from 'redux'
import App from './App';

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__() && window.__REDUX_DEVTOOLS_EXTENSION__());

let schemeAttribute = document.createAttribute('scheme');
schemeAttribute.value = 'bright_light';
document.body.attributes.setNamedItem(schemeAttribute);

connect.send('VKWebAppInit');

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>, document.getElementById('root')
);
