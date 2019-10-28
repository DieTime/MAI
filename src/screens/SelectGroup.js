import React, {Component} from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {reduxConnect} from "react-redux";
import {faculties} from '../data/faculties'
import {courses} from '../data/courses'
import {type} from '../data/type'
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Dismiss from '@vkontakte/icons/dist/24/dismiss';
import firebase from 'firebase/app';
import 'firebase/database';
import {
    View,
    Panel,
    PanelHeader,
    Button,
    Tooltip,
    SelectMimicry,
    FormLayout,
    ModalPage,
    ModalRoot,
    HeaderButton,
    ModalPageHeader,
    platform,
    IOS,
    ANDROID,
    Radio,
    FormLayoutGroup,
    Alert,
    ScreenSpinner
} from '@vkontakte/vkui'

const OSNAME = platform();
const MODAL_PAGE_FACULTY = 'faculty';
const MODAL_PAGE_CURSE = 'curse';
const MODAL_PAGE_TYPE = 'type';
const MODAL_PAGE_GROUPS = 'groups';

class SelectGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popout: null,
            activeModal: null,
            modalHistory: [],
            faculty: null,
            curse: null,
            type: null,
            schedule: null,
            groups: [],
            showMessage: false,
        }
    }

    openPopout = () => {
        this.setState({
            popout:
                <Alert
                    actions={[{
                        title: 'Ок',
                        autoclose: true,
                    }]}
                    onClose={() => {
                        this.setState({popout: null})
                    }
                    }
                >
                    <h2>Групп по данному запросу не найдено</h2>
                    <p>Пожалуйста проверьте корректность введенных данных</p>
                </Alert>
        });
    };

    modalBack = () => {
        this.setActiveModal(this.state.modalHistory[this.state.modalHistory.length - 2]);
    };

    setActiveModal = (activeModal) => {
        activeModal = activeModal || null;
        let modalHistory = this.state.modalHistory ? [...this.state.modalHistory] : [];

        if (activeModal === null) {
            modalHistory = [];
        } else if (modalHistory.indexOf(activeModal) !== -1) {
            modalHistory = modalHistory.splice(0, modalHistory.indexOf(activeModal) + 1);
        } else {
            modalHistory.push(activeModal);
        }

        this.setState({
            activeModal,
            modalHistory
        });
    };

    getGroupsList = () => {
        this.setState({groups: []});
        this.setState({popout: <ScreenSpinner/>});
        fetch('https://cors-anywhere.herokuapp.com/https://mai.ru/education/schedule/?department=' + this.state.schedule + '&course=' + this.state.curse)
            .then((response) => response.text())
            .then((html) => {
                let parser = new DOMParser();
                let htmlDoc = parser.parseFromString(html, 'text/html');
                let list = htmlDoc.getElementsByClassName('sc-groups');
                for (let item of list) {
                    let type = item.children[0].innerText;
                    if (type === this.state.type) {
                        let groupList = item.getElementsByTagName('a');
                        let groups = [];
                        for (let group of groupList) {
                            groups.push(group.innerText)
                        }
                        this.setState({groups: groups})
                    }
                }
                this.setState({popout: null});
                if (this.state.groups.length !== 0) {
                    this.setActiveModal(MODAL_PAGE_GROUPS);
                } else {
                    this.openPopout();
                }
            });

    };

    render() {
        const modal = (
            <ModalRoot activeModal={this.state.activeModal}>
                <ModalPage
                    id={MODAL_PAGE_FACULTY}
                    header={
                        <ModalPageHeader
                            left={OSNAME === ANDROID &&
                            <HeaderButton onClick={this.modalBack}><Icon24Cancel/></HeaderButton>}
                            right={OSNAME === IOS &&
                            <HeaderButton onClick={this.modalBack}><Icon24Dismiss/></HeaderButton>}
                        >
                            Выберите факультет
                        </ModalPageHeader>
                    }
                    onClose={this.modalBack}
                    settlingHeight={80}
                >
                    <FormLayout>
                        <FormLayoutGroup>
                            {faculties.map((elem) => {
                                return (
                                    <Radio name="radio" onClick={() => {
                                        this.setState({faculty: elem.faculty});
                                        this.setState({schedule: elem.schedule});
                                        this.modalBack();
                                    }} key={elem.schedule}>{elem.faculty}</Radio>
                                );
                            })}
                        </FormLayoutGroup>
                    </FormLayout>
                </ModalPage>
                <ModalPage
                    id={MODAL_PAGE_CURSE}
                    header={
                        <ModalPageHeader
                            left={OSNAME === ANDROID &&
                            <HeaderButton onClick={this.modalBack}><Icon24Cancel/></HeaderButton>}
                            right={OSNAME === IOS &&
                            <HeaderButton onClick={this.modalBack}><Icon24Dismiss/></HeaderButton>}
                        >
                            Выберите курс
                        </ModalPageHeader>
                    }
                    onClose={this.modalBack}
                    settlingHeight={80}
                >
                    <FormLayout>
                        <FormLayoutGroup>
                            {courses.map((name) => {
                                return (
                                    <Radio name="radio" onClick={() => {
                                        this.setState({curse: name});
                                        this.modalBack();
                                    }} key={name}>{name + ' курс'}</Radio>
                                );
                            })}
                        </FormLayoutGroup>
                    </FormLayout>
                </ModalPage>
                <ModalPage
                    id={MODAL_PAGE_TYPE}
                    header={
                        <ModalPageHeader
                            left={OSNAME === ANDROID &&
                            <HeaderButton onClick={this.modalBack}><Icon24Cancel/></HeaderButton>}
                            right={OSNAME === IOS &&
                            <HeaderButton onClick={this.modalBack}><Icon24Dismiss/></HeaderButton>}
                        >
                            Выберите квалификацию
                        </ModalPageHeader>
                    }
                    onClose={this.modalBack}
                    settlingHeight={80}
                >
                    <FormLayout>
                        <FormLayoutGroup>
                            {type.map((name) => {
                                return (
                                    <Radio name="radio" onClick={() => {
                                        this.setState({type: name});
                                        this.modalBack();
                                    }} key={name}>{name}</Radio>
                                );
                            })}
                        </FormLayoutGroup>
                    </FormLayout>
                </ModalPage>
                <ModalPage
                    id={MODAL_PAGE_GROUPS}
                    header={
                        <ModalPageHeader
                            left={OSNAME === ANDROID &&
                            <HeaderButton onClick={this.modalBack}><Icon24Cancel/></HeaderButton>}
                            right={OSNAME === IOS &&
                            <HeaderButton onClick={this.modalBack}><Icon24Dismiss/></HeaderButton>}
                        >
                            Выберите факультет
                        </ModalPageHeader>
                    }
                    onClose={this.modalBack}
                    settlingHeight={80}
                >
                    <FormLayout>
                        <FormLayoutGroup>
                            {this.state.groups.map((elem) => {
                                return (
                                    <Radio name="radio" onClick={() => {
                                        let database = firebase.database();
                                        database.ref().child(this.props.store.id).set(elem).then(() => {
                                            this.modalBack();
                                            this.props.chooseGroup(elem);
                                        });
                                    }} key={elem}>{elem}</Radio>
                                );
                            })}
                        </FormLayoutGroup>
                    </FormLayout>
                </ModalPage>
            </ModalRoot>
        );

        return (
            <View id='main' popout={this.state.popout} activePanel='groupPanel' modal={modal}>
                <Panel id='groupPanel'>
                    <PanelHeader>Выберите группу</PanelHeader>
                    <FormLayout style={{background: '#fff'}}>
                        <SelectMimicry style={{marginTop: 10}}
                                       placeholder={(this.state.faculty === null) ? 'Выберите факультет' : this.state.faculty}
                                       onClick={() => {
                                           this.setActiveModal(MODAL_PAGE_FACULTY)
                                       }}/>
                        <SelectMimicry placeholder={(this.state.curse === null) ? 'Выберите курс' : this.state.curse}
                                       onClick={() => {
                                           this.setActiveModal(MODAL_PAGE_CURSE)
                                       }}/>
                        <SelectMimicry
                            placeholder={(this.state.type === null) ? 'Выберите квалификацию' : this.state.type}
                            onClick={() => {
                                this.setActiveModal(MODAL_PAGE_TYPE)
                            }}/>
                        <Tooltip text="Заполните все поля"
                                 isShown={this.state.showMessage}
                                 onClose={() => this.setState({showMessage: false})}
                                 title="Перед выбором группы"
                        >
                            <Button style={{background: '#00a1f5', color: '#fff'}} size="xl"
                                    level="secondary" onClick={() => {
                                if (this.state.faculty !== null && this.state.curse !== null && this.state.type !== null) {
                                    this.getGroupsList();
                                } else {
                                    this.setState({showMessage: true})
                                }
                            }
                            }>
                                Выбрать группу
                            </Button>
                        </Tooltip>
                    </FormLayout>
                </Panel>
            </View>
        )
    }
}

export default reduxConnect(
    state => ({
        store: state,
    }), dispatch => ({
        chooseGroup: (group) => {
            dispatch({type: 'selectGroup', payload: group});
        },
    })
)(SelectGroup);

