import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, FormControl, MenuItem, Select, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TextField, InputLabel, InputAdornment } from '@mui/material';
import { DateTimeRangePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import isEqual from 'lodash/isEqual';
import _ from 'lodash';
import SideBar from './SideBar';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from "@mui/material/Snackbar";
import Alert from '@mui/material/Alert';

function App() {

  const [AtmList, setAtmList] = useState(null);
  const [AidList, setAidList] = useState(null);
  const [HostResponseList, setHostResponseList] = useState(null);
  const [AtmPastFutureTxn, setAtmPastFutureTxn] = useState(null);
  const [TxnLog, setTxnLog] = useState(null);
  const [TransactionTypes, setTransactionTypes] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [AtmOption, setAtmOption] = useState(null);
  const [AidOption, setAidOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [TableContents, setTableContents] = useState([-1]);
  const [PanValue, setPanValue] = useState(null);
  const [SerialValue, setSerialValue] = useState(null);
  const [TableSearch, setTableSearch] = useState(null);
  const [TableContentsFiltered, setTableContentsFiltered] = useState([])
  const [SnackBarOpen, setSnackBarOpen] = useState(false);
  //const TableContents = [];

  const getAtmList = async () => {

    try {
      const response = await fetch('https://dev.smartjournal.net/um/test/api/jr/txn/atmlist/v1');
      const json = await response.json();
      setAtmList(json);
    } catch (error) {
      console.error(error)
    }

  }

  const getAidList = async () => {

    try {
      const response = await fetch('https://dev.smartjournal.net/um/test/api/jr/txn/aidlist/v1');
      const json = await response.json();
      setAidList(json);
    } catch (error) {
      console.error(error)
    }

  }

  const getHostResponseList = async () => {

    try {
      const response = await fetch('https://dev.smartjournal.net/um/test/api/jr/txn/hstlist/v1');
      const json = await response.json();
      setHostResponseList(json);
    } catch (error) {
      console.error(error)
    }


  }

  const getAtmPastFutureTransactions = async (atmid, datetime) => {

    try {
      const response = await fetch('https://dev.smartjournal.net:443/um/test/api/jr/txn/txnlist/' + atmid + '/' + datetime + '/v1?n=3');
      let json = await response.json();
      if (!(Object.entries(json).length === 0)) {
        json.dateString = datetime;
      }
      setAtmPastFutureTxn(json);
    } catch (error) {
      console.error(error)
    }

  }
  const getTransactionLog = async () => {

    try {
      const response = await fetch('https://dev.smartjournal.net:443/um/test/api/jr/txn/log/v1');
      const json = await response.json();
      setTxnLog(json);
    } catch (error) {
      console.error(error)
    }

  }
  const getTransactionTypes = async () => {

    try {
      const response = await fetch('https://dev.smartjournal.net:443/um/test/api/jr/txn/ttplist/v1');
      const json = await response.json();
      setTransactionTypes(json);
    } catch (error) {
      console.error(error)
    }

  }


  const populateTableContent = async () => {
    let tableEntry = {};
    for (let j = 0; j < AtmPastFutureTxn.txn.length; j++) { // go through all transactions (n=3)
      let entryDescription = "";
      let entryCode = "";
      if (AtmPastFutureTxn.txn[j].ttp) {
        entryDescription += AtmPastFutureTxn.txn[j].ttp.descr + "\n";
        entryCode += AtmPastFutureTxn.txn[j].ttp.txt + "\n";
      }
      if (AtmPastFutureTxn.txn[j].key) {
        for (let k = 0; k < AtmPastFutureTxn.txn[j].key.length; k++) { // go through all keys (2 - 4) to create description and code
          entryDescription += AtmPastFutureTxn.txn[j].key[k].descr + "\n";
          entryCode += AtmPastFutureTxn.txn[j].key[k].txt + "\n";
        }
      }
      if (AtmPastFutureTxn.txn[j].hst) {
        entryDescription += AtmPastFutureTxn.txn[j].hst.descr;
        entryCode += AtmPastFutureTxn.txn[j].hst.txt;
      }
      let appEntry;
      if (AtmPastFutureTxn.txn[j].app) {
        appEntry = AtmPastFutureTxn.txn[j].app.id;
      }
      tableEntry = {
        app: appEntry,
        atm: AtmPastFutureTxn.txn[j].atm.txt,
        pan: AtmPastFutureTxn.txn[j].pan,
        date: AtmPastFutureTxn.dateString.slice(4, 6) + "/" + AtmPastFutureTxn.dateString.slice(6, 8) + "/" + AtmPastFutureTxn.dateString.slice(0, 4),
        description: entryDescription,
        code: entryCode,
        ref: AtmPastFutureTxn.txn[j].ref

      };

      if (!TableContents.includes(JSON.stringify(tableEntry))) { // checks if exact same entry exists
        if ((AidOption === 'all' || tableEntry.app === AidOption) &&
          (!PanValue || (tableEntry.pan && tableEntry.pan.includes(PanValue.toString()))) &&
          (!SerialValue || tableEntry.ref === SerialValue)) {
          pushElement(tableEntry);
        }
      }
    }
  }

  // Function to push a new element to the array
  const pushElement = (newElement) => {
    // Get the current state value of the array
    const currentArray = [...TableContents]; // Create a copy of the array
    // Modify the copy by pushing the new element
    currentArray.push(newElement);
    // Update the state with the modified array
    setTableContents(currentArray);
  };

  const padZero = (num) => {
    return num < 10 ? '0' + num : num;
  }

  const updateTableContents = async () => {
    let startDate = dateRange[0];
    let endDate = dateRange[1];
    //Date Format: yyyymmddtttttt
    let startDateYear = startDate.$y;
    let endDateYear = endDate.$y;
    let startDateMonth = startDate.$M + 1;
    let endDateMonth = endDate.$M + 1;
    let startDateDay = startDate.$D;
    let endDateDay = endDate.$D;
    let startDateHour = startDate.$H;
    let endDateHour = endDate.$H;
    let startDateMinute = startDate.$m;
    let endDateMinute = endDate.$m;
    let startDateString = "" + startDateYear + padZero(startDateMonth) + padZero(startDateDay) + padZero(startDateHour) + padZero(startDateMinute) + '00';
    let endDateString = "" + endDateYear + padZero(endDateMonth) + padZero(endDateDay) + padZero(endDateHour) + padZero(endDateMinute) + '00';

    if (AtmOption == "all") {
      for (let i = 0; i < AtmList.length; i++) {
        let currentid = AtmList[i].id;
        //console.log(currentid);
        await getAtmPastFutureTransactions(currentid, startDateString);
        await getAtmPastFutureTransactions(currentid, endDateString);

      }
      setLoading(false);
    }
    else {
      await getAtmPastFutureTransactions(AtmOption, startDateString);
      await getAtmPastFutureTransactions(AtmOption, endDateString);
      setLoading(false);
    }

    /*
    //## GETS every Past Future Transaction at every minute between startDateString and endDateString n (3) times of every atm
   // ## Logically sound but takes too long to load 

    //let pass=0;
    while (startDateString != endDateString) {
      

      //increases time
      startDateMinute = startDateMinute + 1;
      if (startDateMinute == 60) {
        startDateMinute = 0;
        startDateHour = startDateHour + 1;
        if (startDateHour == 24) {
          startDateHour = 0;
          startDateDay = startDateDay + 1;
          if (startDateDay == 30) {
            startDateDay = 1;
            startDateMonth = startDateMonth + 1;
            if (startDateMonth == 12) {
              startDateMonth = 1;
              startDateYear = startDateYear + 1;
            }
          }
        }
      }
      startDateString = startDateYear + padZero(startDateMonth) + padZero(startDateDay) + padZero(startDateHour) + padZero(startDateMinute) + '00';
      //pass+=1;
    }
    */
    //console.log(TableContents);
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  }
  const handleSelectApplication = (event) => {
    setAidOption(event.target.value);
  }
  const handleSelectAtm = (event) => {
    setAtmOption(event.target.value);
  }

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }
  function savePAN(value) {
    setPanValue(value);
  }
  function saveSerial(value) {
    setSerialValue(value);
  }
  function saveTableSearch(value) {
    setTableSearch(value);
  }
  const processPAN = debounce((value) => savePAN(value));
  const processSerial = debounce((value) => saveSerial(value));
  const processTableSearch = debounce((value) => saveTableSearch(value));

  const handleInputPan = (event) => {
    processPAN(event.target.value);
  }
  const handleInputSerial = (event) => {
    processSerial(event.target.value);
  }
  const handleInputTableSearch = (event) => {
    processTableSearch(event.target.value);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all(
          getAtmList(),
          getAidList(),
          getHostResponseList(),
          //getTransactionLog(),
          //getAtmPastFutureTransactions(15, 20240901113800),
          getTransactionTypes(),
        );
      } catch (error) {
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    //console.log(AidList);
  }, [AidList])
  useEffect(() => {
    //console.log(AtmList);
  }, [AtmList])
  useEffect(() => {
    //console.log(HostResponseList);
  }, [HostResponseList])
  useEffect(() => {
    if (AtmPastFutureTxn && !(Object.entries(AtmPastFutureTxn).length === 0)) {
      //console.log(AtmPastFutureTxn.txn);
      populateTableContent();
    }

  }, [AtmPastFutureTxn])
  useEffect(() => {
    //console.log(TxnLog)
  }, [TxnLog])
  useEffect(() => {
    //console.log(TransactionTypes)
  }, [TransactionTypes])

  useEffect(() => {
    if (!_.some(dateRange, _.isNull)) {
      //console.log(dateRange);
    }
  }, [dateRange])
  useEffect(() => {
    //console.log(AidOption);
  }, [AidOption])
  useEffect(() => {
    //console.log(AtmOption);
  }, [AtmOption])

  useEffect(() => {
    if (!_.some(dateRange, _.isNull) && AidOption != null && AtmOption != null) {
      setLoading(true);
      setTableContents([]);
      updateTableContents();
    }
  }, [dateRange, AidOption, AtmOption, PanValue, SerialValue])

  useEffect(() => {

    //console.log(TableContents);

  }, [TableContents])

  useEffect(() => {
    console.log("Pan Value: " + PanValue);
    console.log("Serial Value: " + SerialValue);
  }, [PanValue, SerialValue])

  useEffect(() => {

    if (loading == true) {
      console.log("currently loading");
    }
    if (loading == false) {
      console.log("done loading.");
    }
  }, [loading])

  useEffect(() => {
    if (loading == false) {
      setLoading(true);
      if (TableSearch == null || TableSearch == "") {
        setTableContentsFiltered([]);
      }
      else {
        //setTableContentsFiltered([]);
        const currentTable = [...TableContents];
        const currentTableContentsFiltered = [];
        for (let i = 0; i < currentTable.length; i++) {
          let currentTableProperties = Object.values(currentTable[i]);
          //console.log(currentTableProperties);
          if (currentTableProperties.some(property => typeof property === 'string' && property.toLowerCase().includes(TableSearch.toLowerCase()))) {
            currentTableContentsFiltered.push(currentTable[i]);
          }
        }
        setTableContentsFiltered(currentTableContentsFiltered);
      }
      setLoading(false);
    }


  }, [TableSearch])

  const handleOpenSnackBar = () =>{
    setSnackBarOpen(true);
  }
  const handleCloseSnackBar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpen(false);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <SideBar />
      <Snackbar open={SnackBarOpen} autoHideDuration={6000} onClose={handleCloseSnackBar}>
        <Alert
          onClose={handleCloseSnackBar}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Feature not implemented
        </Alert>
      </Snackbar>
      <Box sx={{ flex: 1, padding: '16px' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Typography variant="h4">All Transactions</Typography>
          <Box>
            <Button variant="outlined" style={{ marginRight: '8px' }} onClick={handleOpenSnackBar}>Print</Button>
            <Button variant="outlined" onClick={handleOpenSnackBar}>Export</Button>
          </Box>
        </Box>

        {/* Search parameters */}
        <Box sx={{ marginBottom: '16px', paddingTop: "10px" }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimeRangePicker
                localeText={{ start: 'Start Date', end: 'End Date' }}
                sx={{ marginRight: '8px' }}
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </LocalizationProvider>
            <FormControl sx={{ marginRight: "8px", width: "25%" }}>
              <InputLabel>ATM ID</InputLabel>
              <Select
                label="ATM ID"
                onChange={handleSelectAtm}
              >
                <MenuItem key={'all'} value={'all'}>All ATMs</MenuItem>
                {AtmList && AtmList.map((atm) => (
                  <MenuItem key={atm.id} value={atm.id}>{atm.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField sx={{ marginRight: "8px" }} label="Partial or full card number" onKeyUp={handleInputPan} />
            <FormControl sx={{ marginRight: "8px", width: "25%" }}>
              <InputLabel>Chip Aid</InputLabel>
              <Select
                label="Chip Aid"
                onChange={handleSelectApplication}
              >
                <MenuItem key={'all'} value={'all'}>All Applications</MenuItem>
                {AidList && AidList.map((aid) => (
                  <MenuItem key={aid.id} value={aid.id}>{aid.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField sx={{ marginRight: "8px" }} label="4 digit number" onKeyUp={handleInputSerial} />
          </Box>
        </Box>

        {/* Table */}
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>ATM ID</TableCell>
                  <TableCell>Customer PAN</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>
                    <TextField label={"Search table"} InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }} onKeyUp={handleInputTableSearch} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={1}>Loading table...</TableCell>
                    <TableCell colSpan={1}><CircularProgress/></TableCell>
                  </TableRow>
                ) : TableContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No results found.</TableCell>
                  </TableRow>
                ) : TableContents.length === 1 && TableContents[0] === -1 ? (
                  <TableRow>
                    <TableCell colSpan={6}>Please provide a start date, end date, ATM, and Application option to retrieve transaction data.</TableCell>
                  </TableRow>
                ) : TableContentsFiltered && TableContentsFiltered.length > 0 ? (
                  TableContentsFiltered.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.atm}</TableCell>
                      <TableCell>{entry.pan}</TableCell>
                      <TableCell>{entry.description.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}</TableCell>
                      <TableCell colSpan={2}>{entry.code.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}</TableCell>
                    </TableRow>
                  ))
                ) : TableSearch && TableSearch.length > 0 && TableContentsFiltered.length == 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No results found.</TableCell>
                  </TableRow>
                ) : (
                  TableContents.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.atm}</TableCell>
                      <TableCell>{entry.pan}</TableCell>
                      <TableCell>{entry.description.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}</TableCell>
                      <TableCell colSpan={2}>{entry.code.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}</TableCell>
                    </TableRow>
                  ))
                )}
                {/* Add more rows as needed */}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>

  );
}

export default App;

