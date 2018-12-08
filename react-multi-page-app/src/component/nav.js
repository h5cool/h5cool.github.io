
import React, { Component } from "react";
import "./nav.scss";
import logo from "src/pages/react-multi.png"
const baseUrl="/react-multi-page-app/demo"
export default class Nav extends Component {

	render() {
		return (
			<div className="menu columns">
				<div className="column is-2 logo"><img  src={logo} /></div>
				<div className="columns column nav is-8">
					<div className="nav-item"><a href={`${baseUrl}`} >Home</a></div>
					<div className="nav-item"><a href={`${baseUrl}/todo`}>Todo</a></div>
					<div className="nav-item"><a href= "https://github.com/leinov/webpack-react-multi-page/">Github</a></div>
				</div>
				<div className="column is-2"></div>
	    </div>
		);
	}
}
