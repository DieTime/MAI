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
    ANDROID,
    ModalRoot,
    ModalPage,
    ModalPageHeader,
    HeaderButton,
    FormLayout,
    FormLayoutGroup,
    Radio,
    Button,
    Tooltip,
    Footer
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
            weekData: [],
            showMessage: false
        }
    }

    componentDidMount() {
        fetch('https://cors-anywhere.herokuapp.com/https://mai.ru/education/schedule/detail.php?group=' + this.props.store.group)
            .then((response) => response.text())
            .then((html) => {
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
                    for (let subject of subjects) {
                        console.log(subjects);
                        let subjectObj = {
                            time: subject.children[0].innerText,
                            type: subject.children[2].innerText,
                            title: subject.children[3].children[0].children[0].innerText,
                            teacher: (subject.children[3].children[0].children.length < 2) ? '' : this.beautify(subject.children[3].children[0].children[2].innerText),
                            location: (subject.children[4].childNodes.length > 1) ? subject.children[4].childNodes[1].nodeValue : null
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
            .then(() => {
                this.setState({weekData: this.getWeekNum()});
            })
    }

    sortByDay = (arr) => {
        let days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = i; j < arr.length; j++) {
                if (days.indexOf(arr[i]) > days.indexOf(arr[j])) {
                    let swap = arr[j];
                    arr[j] = arr[i];
                    arr[i] = swap;
                }
            }
        }
        return arr;
    };

    beautify = (text) => {
        if (text[0] === ',') {
            return text.substr(1, text.length).trimLeft();
        } else {
            return text;
        }
    };

    getWeekNum = () => {
        if (this.state.dataSet[0] === null) return null;
        let i = 0;
        let dayList = [];
        while (i < this.state.dataSet.length) {
            dayList.push(this.state.dataSet[i].day);
            i++;
        }
        dayList = this.sortByDay(dayList);
        if (dayList.length > 0) {
            let data = null;
            i = 0;
            while (i < this.state.dataSet.length) {
                if (this.state.dataSet[i].day === dayList[0]) {
                    data = this.state.dataSet[i].data;
                }
                i++;
            }
            if (data !== null) {
                i = 1;
                while (i < this.state.weeks.length) {
                    let dataArr = this.state.weeks[i].split(" - ");
                    let startWeekData = dataArr[0].split('.');
                    let endWeekData = dataArr[1].split('.');
                    let currentWeekData = data.split('.');
                    if (startWeekData[1] === currentWeekData[1] && ((parseInt(startWeekData[0]) <= parseInt(currentWeekData[0]) && parseInt(currentWeekData[0]) <= parseInt(endWeekData[0])) || (parseInt(currentWeekData[1]) < parseInt(endWeekData[1])))) {
                        return {
                            day: dayList[0],
                            text: 'Неделя ' + i,
                            dates: this.state.weeks[i],
                            week: i
                        }
                    }
                    i++;
                }
            }
        }
        return null;
    };

    getTimeTable = () => {
        this.setState({dataSet: []});
        let week = (this.state.currentWeek.text === 'Текущая неделя') ? '' : '&week=' + this.state.currentWeek.index;
        fetch('https://cors-anywhere.herokuapp.com/https://mai.ru/education/schedule/detail.php?group=' + this.props.store.group + week)
            .then((response) => response.text())
            .then((html) => {
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
                    for (let subject of subjects) {
                        let subjectObj = {
                            time: subject.children[0].innerText,
                            type: subject.children[2].innerText,
                            title: subject.children[3].children[0].children[0].innerText,
                            teacher: (subject.children[3].children[0].children.length < 2) ? '' : subject.children[3].children[0].children[2].innerText,
                            location: (subject.children[4].childNodes.length > 1) ? subject.children[4].childNodes[1].nodeValue : null
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
                if (data.length === 0) this.setState({dataSet: [null]});
                else this.setState({dataSet: data});
            })
            .then(() => {
                this.setState({weekData: this.getWeekNum()});
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
                                        if (this.state.currentWeek.text !== text) {
                                            await this.setState({currentWeek: {text, index}});
                                            this.getTimeTable();
                                        }
                                        this.modalBack();
                                    }} key={text}>{
                                        (index !== 0)
                                            ? this.dateReformat(text) + ' (Неделя ' + index + ')'
                                            : text}
                                    </Radio>
                                );
                            })}
                        </FormLayoutGroup>
                    </FormLayout>
                </ModalPage>
            </ModalRoot>
        );

        if (this.state.weeks.length === 0) {
            return (
                <Spinner size="large"
                         style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto'}}/>
            )
        } else if (this.state.dataSet.length === 0) {
            return (
                <View id='main' activePanel='main' modal={modal}>
                    <Panel id='main'>
                        <PanelHeader left={<HeaderButton onClick={() => this.props.chooseGroup("")}
                        ><Icon24UserOutGoing style={{color: '#323232'}}/></HeaderButton>}>
                            <PanelHeaderContent
                                status={this.state.currentWeek.text === 'Текущая неделя' ? 'Текущая неделя' : 'Неделя ' + this.state.currentWeek.index}
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
        } else if (this.state.dataSet[0] === null) {
            return (
                <View id='main' activePanel='main' modal={modal}>
                    <Panel id='main'>
                        <PanelHeader left={<HeaderButton onClick={() => this.props.chooseGroup("")}
                        ><Icon24UserOutGoing style={{color: '#323232'}}/></HeaderButton>}>
                            <PanelHeaderContent
                                status={this.state.currentWeek.text === 'Текущая неделя' ? 'Текущая неделя' : 'Неделя ' + this.state.currentWeek.index}
                                aside={<Icon16Dropdown style={{marginLeft: 1}}/>}
                                onClick={() => this.setActiveModal('weeks')}
                            >
                                {this.props.store.group}
                            </PanelHeaderContent>
                        </PanelHeader>
                        <Footer style={{fontSize: 15}}>Нет данных</Footer>
                    </Panel>
                </View>
            )
        } else {
            return (
                <View id='main' activePanel='main' modal={modal}>
                    <Panel id='main'>
                        <PanelHeader left={<HeaderButton onClick={() => this.props.chooseGroup("")}
                        ><Icon24UserOutGoing style={{color: '#323232'}}/></HeaderButton>}>
                            <PanelHeaderContent
                                status={this.state.currentWeek.text === 'Текущая неделя' ? 'Текущая неделя' : 'Неделя ' + this.state.currentWeek.index}
                                aside={<Icon16Dropdown style={{marginLeft: 1}}/>}
                                onClick={() => this.setActiveModal('weeks')}
                            >
                                {this.props.store.group}
                            </PanelHeaderContent>
                        </PanelHeader>
                        {this.state.dataSet.map((item, index) => {
                            if (this.state.weekData !== null && item.day === this.state.weekData.day && index !== 0) return (
                                <Div key={index} style={(index !== 0) ? {paddingTop: 0, paddingBottom: 14} : {
                                    paddingTop: 14,
                                    paddingBottom: 14,
                                }}>
                                    <Div style={{
                                        textAlign: 'center',
                                        fontSize: 16,
                                        paddingBottom: 5,
                                        paddingTop: 3,
                                        fontWeight: 600
                                    }}>{this.state.weekData.text}</Div>
                                    <Div style={{
                                        textAlign: 'center',
                                        marginBottom: 17,
                                        padding: 0,
                                        fontSize: 14,
                                        opacity: 0.4
                                    }}>{'(' + this.state.weekData.dates + ')'}</Div>
                                    <Div style={{padding: 0, borderRadius: 25}}>
                                        <Header level="secondary" style={{
                                            background: '#00a1f5',
                                            color: '#fff',
                                            height: 'auto',
                                            paddingRight: 20,
                                            paddingLeft: 20,
                                        }} aside={<h3 style={{margin: 0, color: '#fff'}}>{item.day}</h3>}>
                                            <h3 style={{margin: 0, color: '#fff'}}>{item.data}</h3>
                                        </Header>
                                    </Div>
                                    {item.subjects.map((subject, index) => {
                                        return (
                                            <Div key={index} style={(index === 0) ? {
                                                background: '#fff',
                                                paddingLeft: 20,
                                                paddingRight: 20,
                                                paddingTop: 20,
                                                paddingBottom: 0
                                            } : {
                                                background: '#fff',
                                                paddingLeft: 20,
                                                paddingRight: 20,
                                                paddingTop: 0,
                                                paddingBottom: 0
                                            }}>
                                                {(index !== 0) ? <div style={{
                                                    marginBottom: 20,
                                                    height: '1px',
                                                    background: '#dcdcdc'
                                                }}/> : null}
                                                <Div style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    display: 'flex',
                                                    padding: 0
                                                }}>
                                                    <Div style={{
                                                        fontSize: 19,
                                                        color: '#323232',
                                                        fontWeight: 700,
                                                        padding: 0
                                                    }}>
                                                        {subject.time}
                                                    </Div>
                                                    <p style={{
                                                        fontSize: 15,
                                                        color: '#323232',
                                                        margin: 0,
                                                        fontWeight: 500
                                                    }}>
                                                        {subject.type}
                                                    </p>
                                                </Div>
                                                <Div style={{
                                                    fontSize: 18,
                                                    color: '#323232',
                                                    fontWeight: 600,
                                                    paddingLeft: 0,
                                                    paddingRight: 0,
                                                    paddingBottom: 0,
                                                    paddingTop: 10
                                                }}>
                                                    {subject.title}
                                                </Div>
                                                {(subject.teacher !== '') ?
                                                    <Div style={{
                                                        fontSize: 13,
                                                        color: '#323232',
                                                        paddingLeft: 0,
                                                        paddingRight: 0,
                                                        paddingBottom: 0,
                                                        paddingTop: 10
                                                    }}>
                                                        {subject.teacher}
                                                    </Div>
                                                    :
                                                    null
                                                }
                                                {(subject.location !== null) ?
                                                    <Div style={{
                                                        fontSize: 14,
                                                        color: '#323232',
                                                        fontWeight: 600,
                                                        paddingLeft: 0,
                                                        paddingRight: 0,
                                                        paddingBottom: 20,
                                                        paddingTop: 10
                                                    }}>
                                                        {subject.location}
                                                    </Div>
                                                    :
                                                    <Div style={{
                                                        fontSize: 14,
                                                        color: '#323232',
                                                        fontWeight: 600,
                                                        paddingLeft: 0,
                                                        paddingRight: 0,
                                                        paddingBottom: 10,
                                                        paddingTop: 10
                                                    }}>
                                                    </Div>
                                                }
                                            </Div>
                                        )
                                    })}
                                </Div>
                            );
                            return (
                                <Div key={index} style={(index !== 0) ? {paddingTop: 0, paddingBottom: 14} : {
                                    paddingTop: 14,
                                    paddingBottom: 14
                                }}>
                                    <Div style={{padding: 0}}>
                                        <Header level="secondary" style={{
                                            background: '#00a1f5',
                                            color: '#fff',
                                            height: 'auto',
                                            paddingRight: 20,
                                            paddingLeft: 20
                                        }} aside={<h3 style={{margin: 0, color: '#fff'}}>{item.day}</h3>}>
                                            <h3 style={{margin: 0, color: '#fff'}}>{item.data}</h3>
                                        </Header>
                                    </Div>
                                    {item.subjects.map((subject, index) => {
                                        return (
                                            <Div key={index} style={(index === 0) ? {
                                                background: '#fff',
                                                paddingLeft: 20,
                                                paddingRight: 20,
                                                paddingTop: 20,
                                                paddingBottom: 0
                                            } : {
                                                background: '#fff',
                                                paddingLeft: 20,
                                                paddingRight: 20,
                                                paddingTop: 0,
                                                paddingBottom: 0
                                            }}>
                                                {(index !== 0) ? <div style={{
                                                    marginBottom: 20,
                                                    height: '1px',
                                                    background: '#dcdcdc'
                                                }}/> : null}
                                                <Div style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    display: 'flex',
                                                    padding: 0
                                                }}>
                                                    <Div style={{
                                                        fontSize: 19,
                                                        color: '#323232',
                                                        fontWeight: 700,
                                                        padding: 0
                                                    }}>
                                                        {subject.time}
                                                    </Div>
                                                    <p style={{
                                                        fontSize: 15,
                                                        color: '#323232',
                                                        margin: 0,
                                                        fontWeight: 500
                                                    }}>
                                                        {subject.type}
                                                    </p>
                                                </Div>
                                                <Div style={{
                                                    fontSize: 18,
                                                    color: '#323232',
                                                    fontWeight: 600,
                                                    paddingLeft: 0,
                                                    paddingRight: 0,
                                                    paddingBottom: 0,
                                                    paddingTop: 10
                                                }}>
                                                    {subject.title}
                                                </Div>
                                                {(subject.teacher !== '') ?
                                                    <Div style={{
                                                        fontSize: 13,
                                                        color: '#323232',
                                                        paddingLeft: 0,
                                                        paddingRight: 0,
                                                        paddingBottom: 0,
                                                        paddingTop: 10
                                                    }}>
                                                        {subject.teacher}
                                                    </Div>
                                                    :
                                                    null
                                                }
                                                <Div style={{
                                                    fontSize: 14,
                                                    color: '#323232',
                                                    fontWeight: 600,
                                                    paddingLeft: 0,
                                                    paddingRight: 0,
                                                    paddingBottom: 20,
                                                    paddingTop: 10
                                                }}>
                                                    {subject.location}
                                                </Div>
                                            </Div>
                                        )
                                    })}
                                </Div>
                            )
                        })}
                        <Div style={{paddingTop: 0}}>
                            <Tooltip text="Это последняя неделя"
                                     isShown={this.state.showMessage}
                                     onClose={() => this.setState({showMessage: false})}
                                     title="Поздравляем"
                            >
                                <Button style={{background: '#00a1f5', color: '#fff'}} size="xl" level="secondary"
                                        onClick={async () => {
                                            let info = await this.getWeekNum();
                                            if (info !== null) {
                                                await this.setState({
                                                    currentWeek: {
                                                        text: toString(info.week + 1),
                                                        index: info.week + 1
                                                    }
                                                });
                                                this.getTimeTable();
                                            } else {
                                                this.setState({showMessage: true})
                                            }
                                        }}>
                                    Слудущая неделя
                                </Button>
                            </Tooltip>
                        </Div>
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
