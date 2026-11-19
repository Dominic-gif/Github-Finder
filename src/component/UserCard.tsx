import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkIfFollowingUser, followGithubUser, unfollowGithubUser } from "../api/github";
import { FaGithubAlt, FaUserMinus, FaUserPlus } from "react-icons/fa";
import type { GithubUser } from "../types";

const UserCard = ({ user }: { user: GithubUser }) => {
    // Query to check if the user is following the given user on Github
 const queryClient = useQueryClient();
 // Following needs a GitHub token; without one (e.g. the public site) the button is hidden
 const hasToken = !!import.meta.env.VITE_GITHUB_API_TOKEN;
 const followKey = ['follow-status', user.login];

 const { data: isFollowing } = useQuery({
   queryKey: followKey,
   queryFn: () => checkIfFollowingUser(user.login),
   enabled: !!user.login && hasToken,
   staleTime: Infinity, // only our own follow/unfollow clicks change this
   retry: false,
 });

    // Mutation to follow the user on Github
    const followMutation = useMutation({
      mutationFn: () => followGithubUser(user.login),
      // Flip the button straight away, before GitHub answers
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: followKey }); // stop an old check overwriting the click
        queryClient.setQueryData(followKey, true);
      },
      onSuccess: () => {
        console.log(`Successfully followed ${user.login}`);
        toast.success(`Successfully followed ${user.login}`);
      },
      onError: (err) => {
        console.error(err.message);
        toast.error(`Failed to follow ${user.login}: ${err.message}`);
        queryClient.setQueryData(followKey, false); // put it back if it failed
      }
    });

    // Mutation to unfollow the user on Github
    const unfollowMutation = useMutation({
      mutationFn: () => unfollowGithubUser(user.login),
      // Flip the button straight away, before GitHub answers
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: followKey }); // stop an old check overwriting the click
        queryClient.setQueryData(followKey, false);
      },
      onSuccess: () => {
        console.log(`Successfully unfollowed ${user.login}`);
        toast.success(`Successfully unfollowed ${user.login}`);
      },
      onError: (err) => {
        console.error(err.message);
        toast.error(`Failed to unfollow ${user.login}: ${err.message}`);
        queryClient.setQueryData(followKey, true); // put it back if it failed
      }
    });

    const handleFollow = () => {
      if (isFollowing) {
        unfollowMutation.mutate();
      } else {
        followMutation.mutate();
      }
    };

    return ( <div className="user-card">
        <img src={user.avatar_url} alt={user.name} className="avatar" />
        <h2>{user.name || user.login}</h2>
        <p className="bio">{user.bio}</p>

        <div className="user-card-buttons">
            {hasToken && isFollowing !== undefined && (
            <button onClick={ handleFollow } disabled={followMutation.isPending || unfollowMutation.isPending} className={ `follow-btn ${isFollowing ? 'following' : ''}`} >
                {isFollowing ? (
                    <>
                    <FaUserMinus className="follow-icon" /> following
                    </>
                ) : (
                    <>
                    <FaUserPlus className="follow-icon" /> follow User
                    </>
                )}
            </button>
            )}
        <a
          href={user.html_url}
           className="profile-btn"
           target="_blank"
           rel="noopener noreferrer"> 
          <FaGithubAlt 
          /> View Github  Profile
          </a>

        </div>

      </div> );

}
export default UserCard;