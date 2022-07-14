//import { StatusBar } from "expo-status-bar";
//import { registerRootComponent } from 'expo';
import React from "react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Button, TextInput, ScrollView, Platform, Image} from "react-native";
import { TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native";

export const countryApi =
  "https://mocki.io/v1/45aa665b-8de3-493d-a103-0c8e902a6f44";
export const countryDetailsApi = "https://restcountries.com/v3.1/name/";

export default function App() {
  
  return (
    <View className="App">
      <Countries />
    </View>
  );
}

function Countries() {
  const { loading, error, data, empty, refetch} = useCountriesData();
  const [countryData, setCountryData] = useState();
  const [showCountryInfo, setShowCountryInfo] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [inputText, setInputText] = useState(empty)


  const inputHandler = (e) => {
    console.log(e);
    const countryName = e.toLowerCase();
    setInputText(countryName);
  };

  useEffect(() => {
    if (showCountryInfo && selectedCountry) {
      const country = selectedCountry.split(" ")[0];
      fetch(`${countryDetailsApi}${country}`)
        .then((res) => res.json())
        .then((result) => {
          setCountryData(result[0]);
        })
        .catch((error) => {
          setError(error)
        });
    }
  }, [selectedCountry, showCountryInfo]);

  const onCountryClick = useCallback((clickedCountry) => {
    setShowCountryInfo(true);
    setSelectedCountry(clickedCountry.country);
  }, []);

  function goBack() {
    setShowCountryInfo(false);
    setCountryData(null);
  }

  if (!loading) {
    return <SafeAreaView><Text style={styles.Loading}>Loading...</Text></SafeAreaView>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>; 
  }

  if (showCountryInfo && !countryData) {
    return <SafeAreaView>
      <Text style={styles.Loading}>Loading...</Text>
      {/* <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Loading_2.gif'}} /> */}
    </SafeAreaView>;
  }

  if (showCountryInfo && countryData !== undefined) {
    
    const langs = Object.values(countryData.languages);
    const currencyKey = Object.keys(countryData.currencies);
    console.log(countryData.flags.png)

    return (
      <SafeAreaView>
      <View className="cardContainer">
        <View style = {styles.heading}>
          <Text style = {styles.h1}> {selectedCountry} </Text>  
          <Button className="returnButton" title="X" onPress={goBack}></Button>
        </View>
        <View className="contentContainer">          
          <Image source={{uri: `${countryData.flags.png}`}} className="image" style={styles.countryImage}/>
          <View>
            <View className="languageHolder">
              <Text style = {styles.languages}> Languages: {langs.join(", ")}</Text>
            </View>
            <View className="currencyHolder">
              <Text style = {styles.languages}> Currency: 
                {" "}
                {countryData.currencies[currencyKey].name}{" "}
                {countryData.currencies[currencyKey].symbol}
              </Text>
            </View>
          </View>
        </View>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
    <View className="main">
      <Text style = {styles.h1}>Countries</Text>
      <View style={{ flexDirection: "row", display: "flex" }}>
        <TextInput
          style = {styles.search}
          value={inputText}
          onChangeText ={inputHandler}
          placeholder="Search..."
          className="search"
        />
        <TouchableOpacity onPress={refetch}>
          <Image source = {{uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Refresh_icon.png',}} style={styles.Button}/>
        </TouchableOpacity>
      </View>
      <List searchText={inputText} data={data} onClick={onCountryClick} setInputText = {setInputText} />
    </View>
    </SafeAreaView>
  );
}


function List(props) {
  const { data, searchText, onClick, setInputText } = props;
  const filteredData = useMemo(
    () => data.filter((el) => el.country.toLowerCase().includes(searchText)),
    [data, searchText]
  );

  return (
    <ScrollView contentContainerStyle = {styles.contentContainer}>  
      {filteredData.map((country) => (
        <ListItem key={country.country} onClick={() => onClick(country)} data={country} inputText = {setInputText}/>
      ))} 
    </ScrollView>
  );
}

function ListItem({ data, onClick }) {
  styles.countryRow.backgroundColor =  'red'
  return (
    <TouchableOpacity onPress = {onClick}>
      <View style = {{width: "95%", 
    backgroundColor: data.color,
    flexDirection: "row",
    borderRadius: 20, 
    margin: 6}}>
      <Text
      className="countryRow"
      style = {styles.countryRow}
    >
      {data.country}
    </Text>
    </View>
    </TouchableOpacity>
  );
}

function useCountriesData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [empty,setEmpty] = useState("")


  const refetch = useRef(() => {
    const empty = "";
    setEmpty(empty); 
    setLoading(false);
    setError(null);
    fetch(countryApi)
      .then((res) => res.json())
      .then((countries) => {
        setLoading(true);
        setData(
          Object.values(countries).map((value) => ({
            ...value,
            color: randomColours(),
          }))
        );
      })
      .catch((error) => {
        setLoading(true);
        setError(error);
      });
  }); 

  useEffect(() => {
    refetch.current();
  }, []);

  return { loading, data, error, empty, refetch: refetch.current };
}

function randomColours() {
  var randomColor = Math.floor(Math.random() * 16777215).toString(16);
  randomColor = "#" + randomColor + "aa";
  return randomColor;
}
const styles = StyleSheet.create({
  App: {
    fontFamily: "sans-serif",
    textAlign: "center",
    justifyContent: "center"
  },
  h1: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 40
  },
  countryBox: {
    width: "95%", 
    backgroundColor: 'rgba(20, 245, 234,0.4)',
    flexDirection: "row",
    borderRadius: 20, 
    margin: 6
  },

  countryRow: {
    alignSelf: 'flex-start',
    margin: 5,
    padding: 7.5,
    width: "95%",
    textAlign: "center"
  },

  countryContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    borderColor:'red'

  },

  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'lightgrey',
    paddingBottom: 50
  },
  
  search: {
    margin: 15,
    justifyContent: "flex-start",
    alignItems: "left",
    flexDirection: "row",
    width: "80%",
    padding: 10,
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },

  Button: {
    width: 30,
    height: 30, 
    margin: 15,
    marginLeft:0,
  },

  Loading: {
    textAlign: "center",
    fontSize: 20,
    paddingTop: "70%"

  },

  countryImage: {
    marginLeft: "11%",
    width: 300, 
    height: 150
  },

  heading: {
    display: 'flex',
  },

  languages: {
    fontWeight: 'bold', 
    fontSize: 15,
    textAlign: "left", 
    margin: 5

  }

  
  // languages: { listStyle: "none", marginBottom: "1em", textAlign: "left" },
  
  // returnButton: {
  //   position: "absolute",
  //   top: "15px",
  //   right: "20px",
  //   opacity: 0.4,
  //   cursor: "pointer"
  // },
  
  // langTitle: {
  //   textDecoration: "underline",
  //   fontWeight: "bold",
  //   textAlign: "left",
  //   paddingLeft: "0",
  //   marginRight: "10px"
  // },
  
  // currencyTitle: {
  //   textDecoration: "underline",
  //   fontWeight: "bold",
  //   textAlign: "left",
  //   paddingLeft: "0",
  //   marginRight: "10px"
  // },
  // ul: {
  //   paddingLeft: "0"
  // },
  // languageHolder: {
  //   display: "flex", marginTop: "20px"
  // },
  // currencyHolder: {
  //   display: "flex", marginTop: "20px"
  // },
  // contentContainer: {
  //   display: "flex", padding: "10px"
  // },
  // image: {
  //   width: "200px", marginRight: "20px"
  // },
  // cardContainer: {
  //   padding: "15px",
  //   border: "1px solid #fefefe",
  //   borderRadius: "8px",
  //   boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.2)",
  //   paddingBottom: "100px"
  // }, 
  // container: {
  //   flex: 1,
  //   backgroundColor: "#fff",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
});
