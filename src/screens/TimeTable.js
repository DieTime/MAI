import React, {Component} from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {reduxConnect} from "react-redux";
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Dismiss from '@vkontakte/icons/dist/24/dismiss';
import Icon28More from '@vkontakte/icons/dist/28/more';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import LoadingScreen from './LoadingScreen'

import {
    Panel,
    PanelHeader,
    View,
    PanelHeaderContent,
    Div,
    platform,
    IOS,
    Header,
    ANDROID,
    ModalRoot,
    PullToRefresh,
    ModalPage,
    ModalPageHeader,
    HeaderButton,
    FormLayout,
    FormLayoutGroup,
    Radio,
    Button,
    Tooltip,
    Cell,
    List,
    HeaderContext,
    Spinner,
    Footer,
    FixedLayout
} from "@vkontakte/vkui";

const OSNAME = platform();

class TimeTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeModal: null,
            dataSet: null,
            sessionDataSet: [],
            currentWeek: {
                text: 'Текущая неделя',
                index: 0
            },
            weeks: [],
            weekData: [],
            showMessage: false,
            activePanel: 'main',
            contextOpened: false,
            fetching: false,
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
                        let subjectObj = {
                            time: subject.children[0].innerText,
                            type: subject.children[2].innerText,
                            title: subject.children[3].children[0].children[0].innerText,
                            teacher: (subject.children[3].children[0].children.length < 2) ? '' : this.beautify(subject.children[3].children[0].children[2].innerText),
                            location: (subject.children[4].childNodes.length > 1) ? subject.children[4].childNodes[1].nodeValue : '--каф.'
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
                if (dataSet.length === 0) this.setState({dataSet: [null]});
                else this.setState({dataSet: dataSet});
            })
            .then(() => {
                this.setState({weekData: this.getWeekNum(), fetching: false});
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
        if (this.state.dataSet[0] === null || this.state.dataSet === null) return [null];
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
        return [null];
    };

    getTimeTable = () => {
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
                            location: (subject.children[4].childNodes.length > 1) ? subject.children[4].childNodes[1].nodeValue : '--каф.'
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
                this.setState({weekData: this.getWeekNum(), fetching: false});
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

    getSession = () => {
        fetch('https://cors-anywhere.herokuapp.com/https://mai.ru/education/schedule/session.php?group=' + this.props.store.group)
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
                            location: (subject.children[4].childNodes.length > 1) ? subject.children[4].childNodes[1].nodeValue : '--каф.'
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
                if (data.length === 0) this.setState({sessionDataSet: [null]});
                else this.setState({sessionDataSet: data});
            })
            .then(() => {
                this.setState({fetching: false})
            })
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
                                            await this.setState({dataSet: [null], weekData: []});
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

        if (this.state.dataSet === null) {
            return <LoadingScreen text='Загрузка расписания...'/>
        } else {
            return (
                <View id='main' activePanel={this.state.activePanel} modal={modal}>
                    <Panel id='main'>
                        <PanelHeader left={<HeaderButton
                            onClick={() => this.setState({contextOpened: !this.state.contextOpened})}
                        ><Icon28More style={OSNAME === IOS ? {paddingLeft: 12, color: '#323232'} : {color: '#323232'}}/></HeaderButton>}>
                            <PanelHeaderContent
                                status={this.state.currentWeek.text === 'Текущая неделя' ? 'Текущая неделя' : 'Неделя ' + this.state.currentWeek.index}
                                aside={<Icon16Dropdown style={{marginLeft: 1}}/>}
                                onClick={() => this.setActiveModal('weeks')}
                            >
                                {this.props.store.group}
                            </PanelHeaderContent>
                        </PanelHeader>
                        <HeaderContext opened={this.state.contextOpened}
                                       onClose={() => this.setState({contextOpened: !this.state.contextOpened})}>
                            <List>
                                <Cell
                                    before={
                                        <div style={{paddingTop: 12, paddingBottom: 10, paddingRight: 16}}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                            >
                                                <path
                                                    fill="#bfbfbf"
                                                    d="M0 1.866h4.313v2.156H0V1.866zm0 3.019h4.313v14.663H0V4.885zm.79 11.95a1.348 1.348 0 102.696 0 1.348 1.348 0 00-2.695 0zm-.79 5.3h4.313V20.41H0v1.725zm5.175-2.026v2.027h5.606v-2.038c-.229-.164-.94-.55-2.587-.55-1.562 0-2.56.35-3.019.56zm0-12.406c.46.21 1.457.56 3.019.56 1.637 0 2.35-.381 2.587-.553V6.18H5.175v1.524zm0 .933v10.539c.624-.234 1.624-.49 3.019-.49 1.258 0 2.074.211 2.587.436V8.691c-.513.224-1.33.435-2.587.435-1.395 0-2.395-.256-3.019-.49zM19.926 1.77l-2.957.607.434 2.112 2.957-.606-.434-2.113zm3.554 17.322l-2.957.607-2.948-14.365 2.957-.606L23.48 19.09zm-1.026-2.56c-.15-.73-.733-1.225-1.3-1.109-.569.117-.91.803-.759 1.532.15.728.732 1.225 1.3 1.108.569-.117.909-.802.759-1.532zm1.2 3.403l-2.958.608.347 1.689L24 21.624l-.347-1.69zM12.074 4.022h4.313V1.866h-4.313v2.156zm0 18.113h4.313V20.41h-4.313v1.725zm0-4.744h4.313V7.042h-4.313v10.35zm0 2.157h4.313v-1.294h-4.313v1.294zm0-13.37h4.313V4.886h-4.313v1.294z"
                                                >
                                                </path>
                                            </svg>
                                        </div>
                                    }
                                    onClick={() => {
                                        this.setState({contextOpened: !this.state.contextOpened});
                                        this.setState({activePanel: 'session'});
                                        if (this.state.sessionDataSet.length === 0) {
                                            this.getSession();
                                        }
                                    }}
                                >
                                    Расписание сессии
                                </Cell>
                                <Cell
                                    before={
                                        <div style={{
                                            paddingTop: 12,
                                            paddingBottom: 10,
                                            paddingRight: 15,
                                            paddingLeft: 1
                                        }}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="22"
                                                height="22"
                                            >
                                                <g fill="#cccccc">
                                                    <path
                                                        d="M21.93 9.733a.929.929 0 00-.199-.299l-2.749-2.749a.917.917 0 00-1.296 1.296l1.185 1.185h-5.12a.916.916 0 100 1.834h5.12l-1.185 1.185a.916.916 0 101.296 1.296l2.75-2.749a.918.918 0 00.199-1z"/>
                                                    <path
                                                        d="M15.585 12.833a.916.916 0 00-.916.917v4.583h-3.667V3.667a.918.918 0 00-.654-.878l-3.183-.956h7.504v4.584a.916.916 0 101.833 0v-5.5A.916.916 0 0015.585 0H.92C.886 0 .856.014.824.017a.919.919 0 00-.388.136C.416.166.39.167.37.181.364.187.361.197.354.203a.908.908 0 00-.244.29C.097.516.094.542.084.568.055.64.023.707.012.784.007.81.016.837.015.864.014.882.002.898.002.917V19.25c0 .437.309.813.737.898l9.167 1.834a.916.916 0 001.096-.898v-.917h4.583c.507 0 .917-.411.917-.917v-5.5a.916.916 0 00-.917-.917z"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0">
                                                        <path fill="#cccccc" d="M0 0H22V22H0z"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                    }
                                    onClick={() => {
                                        this.setState({contextOpened: !this.state.contextOpened});
                                        this.props.chooseGroup("");
                                    }}
                                >
                                    Сменить группу
                                </Cell>
                            </List>
                        </HeaderContext>
                        {this.state.dataSet[0] === null
                            ?
                            <div>
                                {this.state.weekData[0] === null
                                    ? <div>
                                        <Footer style={{fontSize: 16}}>Нет данных</Footer>
                                        <FixedLayout vertical="bottom">
                                            <Div>
                                                <Button style={{
                                                    background: 'linear-gradient(110deg, #00AEFF, #029ef5)',
                                                    color: '#fff'
                                                }}
                                                        size="xl" level="secondary"
                                                        onClick={async () => {
                                                            await this.setState({
                                                                currentWeek: {
                                                                    text: 'Текущая неделя',
                                                                    index: 0
                                                                }
                                                            });
                                                            this.getTimeTable();
                                                        }}>
                                                    Вернуться к текущей неделе
                                                </Button>
                                            </Div>
                                        </FixedLayout>
                                    </div>

                                    : <Spinner size='medium' style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        margin: 'auto'
                                    }}/>
                                }
                            </div>
                            :
                            <PullToRefresh onRefresh={() => {this.setState({fetching: true}); this.getTimeTable()}} isFetching={this.state.fetching}>
                                {this.state.dataSet.map((item, index) => {
                                    if (item.day === this.state.weekData.day && index !== 0) return (
                                        <Div key={index}
                                             style={(index !== 0) ? {paddingTop: 0, paddingBottom: 14} : {
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
                                                }} aside={<h3
                                                    style={{margin: 0, color: '#fff'}}>{item.day}</h3>}>
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
                                    );
                                    return (
                                        <Div key={index}
                                             style={(index !== 0) ? {paddingTop: 0, paddingBottom: 14} : {
                                                 paddingTop: 14,
                                                 paddingBottom: 14
                                             }}>
                                            <Div style={{padding: 0}}>
                                                <Header level="secondary" style={{
                                                    background: 'linear-gradient(110deg, #00AEFF, #029ef5)',
                                                    color: '#fff',
                                                    height: 'auto',
                                                    paddingRight: 20,
                                                    paddingLeft: 20
                                                }} aside={<h3
                                                    style={{margin: 0, color: '#fff'}}>{item.day}</h3>}>
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
                                        <Button style={{
                                            background: 'linear-gradient(110deg, #00AEFF, #029ef5)',
                                            color: '#fff'
                                        }} size="xl" level="secondary"
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
                            </PullToRefresh>
                        }

                    </Panel>
                    <Panel id='session'>
                        <PanelHeader
                            left={<HeaderButton onClick={() => this.setState({activePanel: 'main'})}><Icon28ChevronBack
                                style={OSNAME === IOS ? {color: '#323232', paddingLeft: 12} : {color: '#323232'}}/></HeaderButton>}
                        >
                            <PanelHeaderContent
                                status={this.props.store.group}
                            >
                                Расписание сессии
                            </PanelHeaderContent>
                        </PanelHeader>
                        {this.state.sessionDataSet.length === 0
                            ? <Spinner
                                style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto'}}
                                size='medium'/>
                            : <div>
                                {this.state.sessionDataSet[0] === null
                                    ? <Footer style={{fontSize: 16}}>Нет данных</Footer>
                                    : <PullToRefresh onRefresh={() => {this.setState({fetching: true}); this.getSession()}} isFetching={this.state.fetching}>
                                        {this.state.sessionDataSet.map((item, index) => {
                                            return (
                                                <Div key={index}
                                                     style={(index !== 0) ? {paddingTop: 0, paddingBottom: 14} : {
                                                         paddingTop: 14,
                                                         paddingBottom: 14
                                                     }}>
                                                    <Div style={{padding: 0}}>
                                                        <Header level="secondary" style={{
                                                            background: 'linear-gradient(110deg, #00AEFF, #029ef5)',
                                                            color: '#fff',
                                                            height: 'auto',
                                                            paddingRight: 20,
                                                            paddingLeft: 20
                                                        }} aside={<h3
                                                            style={{margin: 0, color: '#fff'}}>{item.day}</h3>}>
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
                                    </PullToRefresh>
                                }
                            </div>
                        }
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
