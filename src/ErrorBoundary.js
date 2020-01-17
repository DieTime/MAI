import React from 'react'
import TimeTable from "./screens/TimeTable";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, info) {
        console.log(error);
        console.log(info);
        this.setState({hasError: true});
    }

    render() {
        if (this.state.hasError) {
            return <TimeTable text='Ошибка при загрузке'/>
        }
        return this.props.children;
    }
}