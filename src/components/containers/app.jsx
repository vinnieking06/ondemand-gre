//import React, { Component } from 'react';
const React = require('react');
import { render } from 'react-dom';
import $ from 'jquery';
import Login from './../views/auth/login.jsx';
import Banner from './../views/banner/banner.jsx';
import Nav from './../views/nav/nav.jsx';
import Breadcrumbs from './../views/breadcrumbs/breadcrumbs.jsx';
import Menu from './../views/menu/menu.jsx';
import Video from './../views/video/video.jsx';
import Accordion from './../views/menu/accordion.jsx';
import Content from './../views/content/content.jsx';
import db from './../../../renderer.js';
import Datastore from 'nedb';
//const fs = require('fs');
// const request = require('request');
import electron, { ipcRenderer } from 'electron';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.setCurrentVideo = this.setCurrentVideo.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.setUser = this.setUser.bind(this);
    this.saveUserData = this.saveUserData.bind(this);
    this.playVideo = this.playVideo.bind(this);
    this.getVideoData = this.getVideoData.bind(this);
    this.expandLesson = this.expandLesson.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.downloadIndVid = this.downloadIndVid.bind(this);
    this.state = {
      authenticated: true,
      showMenu: true,
    };
  }

  setCurrentVideo(video, lesson) {
    const videoTitle = video.title
    const lessonName = lesson.name;
    const lessonDescription = lesson.description;
    const currentVideo = {
      videoTitle: videoTitle,
      lessonName: lessonName,
      lessonDescription: lessonDescription
    }
    this.setState({ currentVideo: currentVideo });
  }

  downloadIndVid(e) {
    e.preventDefault();
    e.stopPropagation();
    const highDefDLVid = `https://gre-on-demand.veritasprep.com/${ e.target.id }.mp4`;
    ipcRenderer.send('download-video', highDefDLVid);
  }
  
  authenticate(e) {
    e.preventDefault();
    const URL = 'https://gmat-on-demand-app.veritasprep.com/checkout/LIBRARY/auth/AEntry.php';
    const action = 'login-gre-desktop-app';
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const key = 'y3yz8E%Xb4bTHDc2Ggh&nQ1X9Vsxm%$0';
    const body = {
      action: 'login-gre-desktop-app',
      username: user,
      password: pass,
      key: key
    }

    $.post(URL, body)
    .then(res => {
      const data = JSON.parse(res);
      if (data.status === 'success') {
        const newState = this.state;
        newState.authenticated = true;
        this.setState({ authenticated: newState.authenticated });
        this.saveUserData(res);
        this.setUser(data.user.firstname);
      }
      if (data.status === 'error') {
        document.getElementById('invalid').innerText = data.message;
      }
    })
    .catch(err => console.log(err));
  }

  setUser(user) {
    const newState = this.state;
    newState.user = user;
    this.setState({ user: newState.user })
  }

  saveUserData(json) {
    db.insert(JSON.parse(json), (err, docs) => {
      if (err) console.log(err);
      console.log('Saved!');
    });
  }

  playVideo(e) {
    const highDef = `https://gre-on-demand.veritasprep.com/${ e.target.id }.mp4`;
    const stdDef= `https://gre-on-demand.veritasprep.com/360p_${ e.target.id }.mp4`;
    document.getElementById('videoPlayer').src = highDef;
    document.getElementById('example_video_1').pause();
    document.getElementById('example_video_1').load();
    document.getElementById('example_video_1').play();
  }

  toggleMenu() {
    const newState = this.state;
    newState.showMenu = !newState.showMenu;
    this.setState({ showMenu: newState.showMenu });
  }

  expandLesson(lesson) {
    const newState = this.state.videoData;
    const index = this.state.videoData.indexOf(lesson);
    newState[index].open = !newState[index].open;
    this.setState({ videoData: newState });
  }

  getVideoData() {
    const URL = 'https://www.veritasprep.com/api/desktop-app/get_playlist.php';
    const body = { type: 'desktop', account: 'GRE' };
    $.post(URL, body)
    .then(res => {
      const accordion = JSON.parse(res).map(item => {
        item.open = false;
        return item;
      });
      this.setState({ videoData: accordion });
    })
    .catch(err => console.log(err));
  }
  
  componentDidMount() {
    this.getVideoData();
  }

  render() {
    if (!this.state.authenticated) {
      return (
        <div style={ app }>
          <Login authenticate={ this.authenticate }/>
        </div>
      )
    }
    else {//if (this.state.authenticated) {
      return (
        <div style={ app }>
          <Content downloadIndVid={ this.downloadIndVid } user={ this.state.user } toggleMenu={ this.state.toggleMenu } currentVideo={ this.state.currentVideo } setCurrentVideo={ this.setCurrentVideo } playVideo={ this.playVideo } videoData={ this.state.videoData } expandLesson={ this.expandLesson} showMenu={ this.state.showMenu } />
        </div>
      )
    }
  }
}

const app = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh'
};


const container = {
  backgroundColor: '#111539',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100vh',
  overflow: 'hidden'
  
}
const me = {
  listStyle: 'none',
}