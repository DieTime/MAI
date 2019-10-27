import React, {Component} from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {reduxConnect} from "react-redux";
import connect from '@vkontakte/vk-connect';
import {firebaseConfig} from "./config";
import * as firebase from 'firebase'
import {Div} from '@vkontakte/vkui'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            currentGroup: null,
            loading: true,
        }
    }

    componentDidMount() {
        connect.sendPromise("VKWebAppGetUserInfo").then(data => {
            this.setState({id: data.id});
            console.log(1);
            return data.id
        }).then((id) => {
            console.log(2);
            firebase.initializeApp(firebaseConfig);
            let database = firebase.database();
            database.ref('/' + id).once('value').then((snapshot) => {
                if (snapshot.val() !== null) {
                    this.setState({currentGroup: snapshot.val()});
                }
            }).then(() => {
                console.log(this.state.id);
                console.log(this.state.currentGroup);
                this.setState({loading: false});
                console.log(this.state.loading);
            });
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <Div>
                    Загрузка
                </Div>
            )
        } else if (this.state.currentGroup === null) {
            return (
                <Div>
                    Выбор группы
                </Div>
            )
        } else {
            return (
                <Div>
                    Расписание
                </Div>
            )
        }
    }
}

export default reduxConnect(
    state => ({
        store: state,
    })
)(App);

