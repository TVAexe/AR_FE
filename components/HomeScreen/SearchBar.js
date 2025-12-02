import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { colors } from "../../constants";

const SearchBar = ({ searchItems, handleProductPress }) => {
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const onChangeSearch = (text) => {
    setQuery(text);

    if (text.trim() === "") {
      setFilteredItems([]);
      setShowDropdown(false);
      return;
    }

    const results = searchItems.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredItems(results);
    setShowDropdown(true);
  };

  const handleSelect = (item) => {
    handleProductPress(item);
    setQuery(item.name);
    setShowDropdown(false);
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.inputContainer}>
        <Searchbar
          placeholder="Search..."
          value={query}
          onChangeText={onChangeSearch}
          style={styles.searchInput}
          inputStyle={{
            fontSize: 14,
            paddingBottom: 20,
          }}
        />

        {showDropdown && filteredItems.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 15,
    padding: 5,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  inputContainer: {
    width: "95%",
  },

  searchInput: {
    borderRadius: 10,
    height: 45,
    backgroundColor: colors.white,
    elevation: 3,
  },

  dropdown: {
    position: "absolute",
    top: 45,
    width: "100%",
    maxHeight: 200,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 5,
    zIndex: 20,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },

  dropdownItemText: {
    color: colors.dark,
  },
});

export default SearchBar;
