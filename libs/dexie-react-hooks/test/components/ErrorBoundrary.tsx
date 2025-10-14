import React, { Component } from "react";

export class ErrorBoundary extends Component<React.PropsWithChildren<{}>, { error: any }> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    //console.error(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div id="errorBoundrary">
          <h1>Something went wrong.</h1>
          <p>{"" + this.state.error}</p>
          <button id="btnRetry" onClick={()=>this.setState({error: null})}>Retry</button>
        </div>
      );
    }

    return this.props.children;
  }
}
