import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleError = error => this.setState({hasError: true, error});
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    //logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div className="error">
        <p>An error has occurred: {error}</p>
        <button onClick={()=>this.setState({hasError: false})}>Got it!</button>
      </div>;
    }

    return this.props.children; 
  }
}
