import React, {Component} from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {reduxConnect} from "react-redux";
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Dismiss from '@vkontakte/icons/dist/24/dismiss';
import Icon24UserOutGoing from '@vkontakte/icons/dist/24/user_outgoing';

import {
    Panel,
    PanelHeader,
    View,
    PanelHeaderContent,
    Spinner,
    Div,
    platform,
    IOS,
    Header,
    ANDROID, ModalRoot, ModalPage, ModalPageHeader, HeaderButton, FormLayout, FormLayoutGroup, Radio,
} from "@vkontakte/vkui";

const OSNAME = platform();

class TimeTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeModal: null,
            dataSet: [],
            currentWeek: {
                text: 'Текущая неделя',
                index: 0
            },
            weeks: [],
        }
    }

    componentDidMount() {
        fetch('https://cors-anywhere.herokuapp.com/https://mai.ru/education/schedule/detail.php?group=' + this.props.store.group)
            .then((response) => response.text())
            .then((html)=>{
                let parser = new DOMParser();
                let htmlDoc = parser.parseFromString(html, 'text/html');
                let cells = htmlDoc.getElementsByClassName('table');
                let list = cells[0].children[0].children;
                let weeksList = [];
                for (let item of list) {
                    weeksList.push(item.childNodes[1].innerText);
                }
                weeksList.unshift('Текущая неделя');
                this.setState({weeks: weeksList});

                let dataSet = [];
                cells = htmlDoc.getElementsByClassName('sc-table-day');
                for (let item of cells) {
                    let oneDay = item.children[0].children;
                    let day = oneDay[0].children[0].innerText;
                    let data = oneDay[0].childNodes[0].data;
                    let subjects = oneDay[1].children[0].children;
                    let dataObj = [];
                    for (let subject of subjects )
                    {
                        let subjectObj = {
                            time: subject.children[0].innerText,
                            type: subject.children[2].innerText,
                            title: subject.children[3].children[0].children[0].innerText,
                            teacher: (subject.children[3].children[0].children.length < 2) ? '' :  subject.children[3].children[0].children[2].innerText,
                            location: subject.children[4].childNodes[1].nodeValue,
                        };
                        dataObj.push(subjectObj);
                    }
                    let dayObj = {
                        day: day,
                        data: data,
                        subjects: dataObj
                    };
                    dataSet.push(dayObj);
                }
                this.setState({dataSet: dataSet});
        })
    }

    getTimeTable = () => {
        this.setState({dataSet: []});
        let week = (this.state.currentWeek.text === 'Текущая неделя') ? '' : '&week=' + this.state.currentWeek.index;
        fetch('https://cors-anywhere.herokuapp.com/https://mai.ru/education/schedule/detail.php?group=' + this.props.store.group + week)
            .then((response) => response.text())
            .then((html)=>{
                let parser = new DOMParser();
                let htmlDoc = parser.parseFromString(html, 'text/html');
                let cells = htmlDoc.getElementsByClassName('sc-table-day');
                let dataSet = [];
                for (let item of cells) {
                    let oneDay = item.children[0].children;
                    let day = oneDay[0].children[0].innerText;
                    let data = oneDay[0].childNodes[0].data;
                    let subjects = oneDay[1].children[0].children;
                    let dataObj = [];
                    for (let subject of subjects )
                    {
                        let subjectObj = {
                            time: subject.children[0].innerText,
                            type: subject.children[2].innerText,
                            title: subject.children[3].children[0].children[0].innerText,
                            teacher: (subject.children[3].children[0].children.length < 2) ? '' :  subject.children[3].children[0].children[2].innerText,
                            location: subject.children[4].childNodes[1].nodeValue,
                        };
                        dataObj.push(subjectObj);
                    }
                    let dayObj = {
                        day: day,
                        data: data,
                        subjects: dataObj
                    };
                    dataSet.push(dayObj);
                }
                return dataSet;
            })
            .then(data => {
                this.setState({dataSet: data});
            })
    };

    modalBack = () => {
        this.setActiveModal(null);
    };

    setActiveModal = (activeModal) => {
        activeModal = activeModal || null;
        this.setState({
            activeModal,
        });
    };

    dateReformat = (date) => {
        let finalDate = '';
        let arr = date.split(" - ");
        let first = arr[0].split(".");
        let second = arr[1].split(".");
        finalDate += first[0] + '.' + first[1] + '.' + first[2].substr(-2) + " - " + second[0] + '.' + second[1] + '.' + second[2].substr(-2);
        return finalDate;
    };

    render() {
        const modal = (
            <ModalRoot activeModal={this.state.activeModal}>
                <ModalPage
                    id="weeks"
                    header={
                        <ModalPageHeader
                            left={OSNAME === ANDROID &&
                            <HeaderButton onClick={this.modalBack}><Icon24Cancel/></HeaderButton>}
                            right={OSNAME === IOS &&
                            <HeaderButton onClick={this.modalBack}><Icon24Dismiss/></HeaderButton>}
                        >
                            Выберите неделю
                        </ModalPageHeader>
                    }
                    onClose={this.modalBack}
                    settlingHeight={80}
                >
                    <FormLayout>
                        <FormLayoutGroup>
                            {this.state.weeks.map((text, index) => {
                                return (
                                    <Radio name="radio" onClick={async () => {
                                        await this.setState({currentWeek: {text, index}});
                                        this.getTimeTable();
                                        this.modalBack();
                                    }} key={text}>{
                                        (index !== 0 )
                                        ? this.dateReformat(text) + ' (Неделя ' + index + ')'
                                        : text }
                                    </Radio>
                                );
                            })}
                        </FormLayoutGroup>
                    </FormLayout>
                </ModalPage>
            </ModalRoot>
        );

        if (this.state.weeks.length === 0){
            return (
                <Spinner size="large"
                         style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto'}}/>
            )
        }
        else if (this.state.dataSet.length === 0){
            return (
                <View id='main' activePanel='main' modal={modal}>
                    <Panel id='main'>
                        <PanelHeader left={<HeaderButton onClick={() => this.props.chooseGroup("")}
                        ><Icon24UserOutGoing style={{color: '#323232'}}/></HeaderButton>}>
                            <PanelHeaderContent
                                status={this.state.currentWeek.text === 'Текущая неделя' ? 'Текущая неделя' : this.dateReformat(this.state.currentWeek.text)}
                                aside={<Icon16Dropdown style={{marginLeft: 1}}/>}
                                onClick={() => this.setActiveModal('weeks')}
                            >
                                {this.props.store.group}
                            </PanelHeaderContent>
                        </PanelHeader>
                        <Spinner size="large"
                                 style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto'}}/>
                    </Panel>
                </View>
            )
        }
        else {
            return (
                <View id='main' activePanel='main' modal={modal}>
                    <Panel id='main'>
                        <PanelHeader left={<HeaderButton onClick={() => this.props.chooseGroup("")}
                        ><Icon24UserOutGoing style={{color: '#323232'}}/></HeaderButton>}>
                            <PanelHeaderContent
                                status={this.state.currentWeek.text === 'Текущая неделя' ? 'Текущая неделя' : this.dateReformat(this.state.currentWeek.text)}
                                aside={<Icon16Dropdown style={{marginLeft: 1}}/>}
                                onClick={() => this.setActiveModal('weeks')}
                            >
                                {this.props.store.group}
                            </PanelHeaderContent>
                        </PanelHeader>
                            {this.state.dataSet.map((item, index)=>{
                                return (
                                    <Div key={index} style={(index !== 0) ? {paddingTop: 0, paddingBottom: 14} : {paddingTop: 14, paddingBottom: 14}}>
                                        <Div style={{padding: 0}}>
                                            <Header level="secondary" style={{background: '#00a1f5', color: '#fff', height: 'auto', paddingRight: 20, paddingLeft: 20}} aside={<h3 style={{margin: 0, color: '#fff'}}>{item.day}</h3>}>
                                                <h3 style={{margin: 0, color: '#fff'}}>{item.data}</h3>
                                            </Header>
                                        </Div>
                                        {item.subjects.map((subject, index) => {
                                            return (
                                                <Div key={index} style={(index === 0) ? {background: '#fff', paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 0} : {background: '#fff', paddingLeft: 20, paddingRight: 20, paddingTop: 0, paddingBottom: 0}}>
                                                    {(index !== 0) ? <div style={{marginBottom: 20, height: '1px', background: '#dcdcdc'}}/> : null}
                                                    <Div style={{alignItems: 'center', justifyContent: 'space-between', display: 'flex', padding: 0}}>
                                                        <Div style={{fontSize: 19, color: '#323232', fontWeight: 700, padding: 0}}>
                                                            {subject.time}
                                                        </Div>
                                                        <p style={{fontSize: 15, color: '#323232', margin: 0, fontWeight: 500}}>
                                                            {subject.type}
                                                        </p>
                                                    </Div>
                                                    <Div style={{fontSize: 18, color: '#323232', fontWeight: 600, paddingLeft: 0, paddingRight: 0, paddingBottom: 0, paddingTop: 10}}>
                                                        {subject.title}
                                                    </Div>
                                                    {(subject.teacher !== '') ?
                                                        <Div style={{fontSize: 13, color: '#323232', paddingLeft: 0, paddingRight: 0, paddingBottom: 0, paddingTop: 10}}>
                                                            {subject.teacher}
                                                        </Div>
                                                        :
                                                        null
                                                    }
                                                    <Div style={{fontSize: 14, color: '#323232', fontWeight: 600, paddingLeft: 0, paddingRight: 0, paddingBottom: 20, paddingTop: 10}}>
                                                        {subject.location}
                                                    </Div>
                                                </Div>
                                            )
                                        })
                                    }
                                    </Div>
                                )
                            })}
                    </Panel>
                </View>
            )
        }
    }
}

export default reduxConnect(
    state => ({
        store: state,
    }), dispatch => ({
        chooseWeek: (week) => {
            dispatch({type: 'chooseWeek', payload: week});
        },
        chooseGroup: (group) => {
            dispatch({type: 'selectGroup', payload: group});
        },
    })
)(TimeTable);
