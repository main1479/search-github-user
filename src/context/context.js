import React, { useState, useEffect, useContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubContextProvider = ({ children }) => {
	const [githubUser, setGithubUser] = useState(mockUser);
	const [followers, setFollowers] = useState(mockFollowers);
	const [repos, setRepos] = useState(mockRepos);
	// states
	const [requests, setRequests] = useState(0);
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState({ show: false, message: '' });

	const checkRequestLimit = async () => {
		try {
			const {
				data: {
					rate: { remaining },
				},
			} = await axios.get(`${rootUrl}/rate_limit`);
			if (!remaining) {
				setIsError({ show: true, message: 'Sorry, you have exceeded your hourly request limit!!' });
			}
			setRequests(remaining);
		} catch (error) {
			console.log(error.message);
		}
	};

	const searchUser = async (user) => {
		try {
			setLoading(true);
			setIsError({ show: false, message: '' });
			const userResponse = await axios.get(`${rootUrl}/users/${user}`);
			if (!userResponse) throw Error('Something went wrong!!');
			const { followers_url, repos_url } = userResponse.data;
			const followersResponse = await axios.get(`${followers_url}?per_page=100`);
			if (!followersResponse) throw Error('Something went wrong!!');
			const reposResponse = await axios.get(`${repos_url}?per_page=100`);
			if (!reposResponse) throw Error('Something went wrong!!');

			setGithubUser(userResponse.data);
			setFollowers(followersResponse.data);
			setRepos(reposResponse.data);

			setLoading(false);
		} catch (error) {
			setLoading(false);
			setIsError({ show: true, message: `There is no user with that username` });
			// setIsError({ show: true, message: error.message });
		}
	};

	useEffect(() => {
		checkRequestLimit();
	}, []);

	return (
		<GithubContext.Provider
			value={{ githubUser, followers, repos, requests, isError, searchUser, loading }}
		>
			{children}
		</GithubContext.Provider>
	);
};

export const useGlobalContext = () => {
	return useContext(GithubContext);
};

export { GithubContextProvider, GithubContext };
