import "./App.css";
import { AutoSuggestionSearch } from "./components/AutoSuggestionSearch";
// import ComboboxNew from "./components/ComboboxNew";
// import MyCombobox from "./components/MyCombobox";

function App() {
  const apiCallOptions = {
    url: "https://firstleap-api.firstconnectsolutions.com/api/v1/users/getLocations",
    queryParams: "search",
    // responsePattern: "data.data",
    // objectKey: "location", //key of data value we want to populate in the list
    // idKey: "_id", // id of the data value
    dropdownItemsCount: 15,
  };
  return (
    <div className="App">
      {/* <MyCombobox /> */}
      {/* <ComboboxNew /> */}
      <AutoSuggestionSearch
        apiCallOptions={apiCallOptions}
        inputPlaceholder="Select location"
        getResponse={(res) => res.data.data}
        getValue={(o) => o._id}
        getLabel={(o) => o.location}
        creatable={(newSkill) => ({
          _id: Math.random() * 6,
          location: newSkill,
        })}
      />
    </div>
  );
}

export default App;
