import { Alert } from "react-native";
import { useEffect, useState } from "react";

const useFirebase = (fn, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, deps); // Re-fetch data when dependencies change

  const refetch = () => fetchData();

  return { data, loading, refetch };
};

export default useFirebase;
