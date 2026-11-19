export const fetchGithubUser = async (username: string) => {
  const res = await fetch(`${import.meta.env.VITE_GITHUB_API_URL}/users/${username}`);
  if (!res.ok) {
    throw new Error('User not found');
  }
  const data = await res.json();
  return data;
};



export const searchGithubUser = async (query: string) => {
  const res = await fetch(`${import.meta.env.VITE_GITHUB_API_URL}/search/users?q=${query}`
  );
  
  if (!res.ok) {
    throw new Error('User not found');
  }
  const data = await res.json();
  return data.items;
};

// Check if following a user on Github
export const checkIfFollowingUser =async (username: string) => {
  const res = await fetch(`${import.meta.env.VITE_GITHUB_API_URL}/user/following/${username}`, {
    cache: 'no-store', // always ask GitHub, never reuse the browser's saved (old) answer
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_API_TOKEN}`,
      Accept: 'application/vnd.github+json'
    }
  }
);
  if (res.status === 204) {
    return true; // User is following
  } else if (res.status === 404) {
    return false; // User is not following
  } else {
    const errorData = await res.json().catch(() => null); 
    throw new Error(errorData?.message || 'Failed to check following status');
  }
};


// Follow User On Github
export const followGithubUser = async (username: string) => {
  const res = await fetch(`${import.meta.env.VITE_GITHUB_API_URL}/user/following/${username}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_API_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'content-Type': 'application/json'
    }
  }
);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to follow user');
  }
  return true; // Successfully followed
};

// Unfollow User On Github
export const unfollowGithubUser = async (username: string) => {
  const res = await fetch(`${import.meta.env.VITE_GITHUB_API_URL}/user/following/${username}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_API_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'content-Type': 'application/json'
    }
  }
);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to unfollow user');
  }
  return true; // Successfully unfollowed
};
