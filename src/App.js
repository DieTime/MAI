import React, {Component} from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {reduxConnect} from "react-redux";
import connect from '@vkontakte/vk-connect';
import {firebaseConfig} from "./config";
import firebase from 'firebase/app';
import 'firebase/database';
import SelectGroup from './screens/SelectGroup'
import TimeTable from './screens/TimeTable'
import LoadingScreen from './screens/LoadingScreen'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            loading: true,
        }
    }

    componentDidMount() {
        connect.sendPromise("VKWebAppGetUserInfo")
            .then(data => {
                this.setState({id: data.id});
                this.props.chooseId(data.id);
                return data.id
            })
            .then((id) => {
                firebase.initializeApp(firebaseConfig);
                let database = firebase.database();
                database.ref('/' + id).once('value')
                    .then((snapshot) => {
                        if (snapshot.val() !== null) {
                            this.setState({currentGroup: snapshot.val()});
                            this.props.chooseGroup(snapshot.val());
                        }
                    })
                    .then(() => {
                        this.setState({loading: false});
                    });
            });
    }

    render() {
        if (this.state.loading) {
            return <LoadingScreen text='Загрузка данных о группе...'/>
        } else if (this.props.store.group === "") {
            return <SelectGroup/>
        } else {
            return <TimeTable/>
        }
    }
}

export default reduxConnect(
    state => ({
        store: state,
    }),
    dispatch => ({
        chooseGroup: (group) => {
            dispatch({type: 'selectGroup', payload: group});
        },
        chooseId: (id) => {
            dispatch({type: 'selectId', payload: id});
        },
    })
)(App);

