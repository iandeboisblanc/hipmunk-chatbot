import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      messages: [],
    };
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleTextInput(e) {
    this.setState({
      inputValue: e.target.value,
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const inputValue = this.state.inputValue;
    const formData = new FormData();
    formData.append('action', 'message');
    formData.append('text', inputValue);

    this.setState({
      inputValue: '',
      messages: this.state.messages.concat({
        from: 'client',
        text: inputValue,
      }),
    });

    fetch('http://localhost:9000/chat/messages', {
      method: 'POST',
      body: formData
    }).then(response => response.json())
    .then((response) => {
      const responseText = response.messages[0].text;
      this.setState({
        messages: this.state.messages.concat({
          from: 'server',
          text: responseText
        }),
      });
    });
  }

  displayMessages() {
    return this.state.messages.map((message) => {
      const className = `message from-${message.from}`;
      return <div className={className}>{message.text}</div>
    })
  }

  render() {
    return (
      <div className="Hipmunk-App">
        <header className="hipmunk-header">
          <h1 className="hipmunk-title">ChatBot</h1>
        </header>
        <div className="chat-window">
          Chat window here
          <div className="messages-section">
            { this.displayMessages() }
          </div>
          <div className="input-section">
            <form onSubmit={this.handleFormSubmit}>
              <input onChange={this.handleTextInput}
                type="text"
                value={this.state.inputValue}></input>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
