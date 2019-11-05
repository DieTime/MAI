import React, {Component} from 'react';
import {Spinner} from "@vkontakte/vkui";

export default class LoadingScreen extends Component {
    render() {
        return (
            <div style={{
                background: 'linear-gradient(110deg, #00AEFF, #029ef5)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexDirection: 'column'
            }}>
                <div style={{height: '63%', display: 'flex', alignItems: 'flex-end'}}>
                    <svg
                        style={{marginBottom: 20}}
                        xmlns="http://www.w3.org/2000/svg"
                        width="152"
                        height="152"
                        fill="none"
                        viewBox="0 0 152 152"
                    >
                        <path
                            fill="#fff"
                            d="M4.15 28.476l5.847-6.15c3.424-3.424 9.19-2.236 9.19-2.236l17.111 2.341 8.667-8.48c4.566-4.484 8.69 2.377 6.896 4.74l-4.45 5.173 18.427 3.413 6.256-7.292c6.685-7.99 11.66-.792 8.643 3.448l-4.042 5.113 27.687 3.611C128.19 9.247 137.909-.256 144.173 5.39c6.304 5.682-4.848 17.008-26.535 39.347l3.937 28.527 5.801-4.834c3.424-2.854 9.504 1.724 3.227 7.676l-7.979 7.525 3.366 18.672 4.985-3.832c4.403-3.506 9.749 1.13 3.798 7.489l-7.921 7.979c-.326.245 2.586 16.378 2.586 16.378 1.793 7.908-2.668 10.798-2.668 10.798l-5.439 4.741-20.664-58.37c-1.713-5.136-6.052-10.714-13.303-10.052-3.832.408-13.512 6.942-14.816 8.492l-22.411 21.549c-.571.407 3.447 28.014 3.447 28.014 0 .815-7.105 10.134-7.105 10.134l-14.2-25.277-7.011 3.262 4.1-6.384L3.8 102.792l9.587-7.012c4.565 1.06 28.503 3.75 28.992 3.506 0 0 19.493-19.332 20.606-20.5 6.44-6.768 8.608-9.296 9.586-12.64.98-3.345-.689-8.247-10.798-14.455C47.831 43.131 4.15 28.476 4.15 28.476z"
                        >
                        </path>
                    </svg>
                </div>
                <div style={{height: '50%', display: 'flex', alignItems: 'flex-start'}}>
                    <div style={{marginTop: 20, color: '#fff'}}>
                        <Spinner size='medium' style={{color: '#fff'}}/>
                    </div>
                </div>
            </div>
        );
    }
}