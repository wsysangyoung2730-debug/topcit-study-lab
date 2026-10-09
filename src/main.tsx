import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
class ErrorBoundary extends React.Component<React.PropsWithChildren, {failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<main style={{padding:48,fontFamily:'sans-serif'}}><h1>화면을 불러오지 못했습니다.</h1><p>저장된 학습 기록은 삭제하지 않았습니다. 새로고침해서 다시 시도해주세요.</p><button onClick={()=>location.reload()}>새로고침</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
