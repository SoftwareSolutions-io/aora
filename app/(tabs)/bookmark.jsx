import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text } from "react-native";
import { getUserBookmarks } from "../../lib/firebase"; // Assuming this function exists in firebase.js
import { useGlobalContext } from "../../context/GlobalProvider";
import { EmptyState, VideoCard } from "../../components";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const [bookmarks, setBookmarks] = useState([]);

  // Fetch user's bookmarked posts
  const fetchBookmarks = async () => {
    try {
      const data = await getUserBookmarks(user.uid); // Assuming Firebase uses uid for user ID
      setBookmarks(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <Text className="text-2xl text-white font-psemibold">Bookmarks</Text>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id} // Assuming Firebase bookmarks have an 'id'
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Bookmarks Found"
            subtitle="You haven't bookmarked any videos yet."
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Bookmark;
