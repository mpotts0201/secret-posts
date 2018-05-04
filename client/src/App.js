import React, { Component } from 'react'
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import SignUpLogIn from './components/SignUpLogIn'
import axios from 'axios'
import PostsList from "./components/PostsList"
import {saveAuthTokens, setAxiosDefaults, userIsLoggedIn} from "./util/SessionHeaderUtil";


class App extends Component {

  state = {
    signedIn: false,
    posts: []
  }

  async componentWillMount() {
    try {
      const signedIn = userIsLoggedIn()

      let posts = []
      if (signedIn) {
        setAxiosDefaults()
        posts = await this.getPosts()
      }

      this.setState({
        posts,
        signedIn,
      })
    } catch (error) {
      console.log(error);
    }
  }

  getPosts = async () => {
    try {
      const response = await axios.get('/posts')
      return response.data
    } catch (error) {
      console.log(error)
      return []
    }
  }

  signUp = async (email, password, password_confirmation) => {
    try {
      const payload = {
        email: email,
        password: password,
        password_confirmation: password_confirmation
      }
      
      const response = await axios.post('/auth', payload)
      saveAuthTokens(response.headers)

      this.setState({ signedIn: true })

    } catch (error) {
      console.log(error)
    }
  }

  signIn = async (email, password) => {
    try {
      const payload = {
        email,
        password
      }
      const response = await axios.post('/auth/sign_in', payload)
      saveAuthTokens(response.headers)


      const posts = await this.getPosts()

      this.setState({
        signedIn: true,
        posts
      })

    } catch (error) {
      console.log(error)
    }
  }

  render() {

    const SignUpLogInComponent = () => (
      <SignUpLogIn
        signUp={this.signUp}
        signIn={this.signIn} />
    )
    const PostsComponent = () => (
      <PostsList
        posts={this.state.posts} />
    )

    return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/signUp" render={SignUpLogInComponent} />
            <Route exact path="/posts" render={PostsComponent} />

          </Switch>

          {this.state.signedIn ? <Redirect to="/posts" /> : <Redirect to="/signUp" />}
        </div>
      </Router>
    )
  }
}

export default App