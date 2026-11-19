import { useState, useEffect } from "react";
import RecentSearches from "./RecentSearches";
import { useQuery } from "@tanstack/react-query";
import { fetchGithubUser, searchGithubUser } from "../api/github";
import UserCard from "./UserCard";
import SuggestionDropdown from "./SuggestionDropdown";
import { useDebounce } from "use-debounce";

 
const UserSearch = () => {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState('');
  const [recentUser, setRecentUser] = useState<string[]>(() => {
      const stored = localStorage.getItem('recentUser');
      return stored ? JSON.parse(stored) : [];
  });

  const [debouncedUsername] = useDebounce(username, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

// Query to fetch specific Github user 

  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', submittedUsername],
    queryFn: async () => 
       fetchGithubUser(submittedUsername),
    enabled: !!submittedUsername,
  });

// Query to fetch suggestions for the user search
  const { data: suggestions } = useQuery({
    queryKey: ['github-user-suggestions', debouncedUsername],
    queryFn: () => searchGithubUser(debouncedUsername),
    enabled: debouncedUsername.length > 1,
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = username.trim();
    if(!trimmed) return;
    setSubmittedUsername(trimmed);
    setUsername('');


    setRecentUser((prev) => {
        const updated = [trimmed, ...prev.filter(u => u !== trimmed)];
        return updated.slice(0, 5);
    });
  
  };
  // Update localStorage whenever recentUser changes
  useEffect(() => {
      localStorage.setItem('recentUser', JSON.stringify(recentUser));
  }, [recentUser]);

    return  <>
    <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
        <input
         type="text" 
         placeholder="Enter Github Username..."
         value={username}
         onChange={(e) => {setUsername(e.target.value);
            const val = e.target.value;
            setUsername(val);
            setShowSuggestions(val.trim().length > 1);
         }
         } />
            {showSuggestions && suggestions?.length > 0 && (
                <SuggestionDropdown 
                    suggestions={suggestions}
                    show={showSuggestions}
                    onSelect={(selccted) => {
                        setUsername(selccted);
                        setShowSuggestions(false);
                        if(submittedUsername !== selccted) {
                            setSubmittedUsername(selccted);
                        } else {
                            refetch();
                        }
                        setRecentUser((prev) => {
                            const updated = [selccted, ...prev.filter(u => u !== selccted)];
                            return updated.slice(0, 5);
                        });
                    }}
                />
            )}
        </div>
         <button type="submit">Search</button>
    </form>
    {isLoading && <p className="status">Loading...</p>}
    {isError && <p className="status error">{error.message}</p>}
    {data && <UserCard user={data} />}
    {recentUser.length > 0 && (
        <RecentSearches 
            users={recentUser} 
            onSelect={(username) => {
                setUsername(username);
                setSubmittedUsername(username);
            }}
        />
    )}
  </> ;
};
 
export default UserSearch;