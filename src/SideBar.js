import React, {useState} from "react";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import Snackbar from "@mui/material/Snackbar";
import Alert from '@mui/material/Alert';

function SideBar() {

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  }
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  }

  return (
    <div>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <List>
          <ListItem><h2 style={{ fontFamily: "Arial" }}>Transactions Coding Challenge</h2></ListItem>
          <ListItemButton
            style={{ fontFamily: "Arial" }}
          >
            Transactions
          </ListItemButton>
          <ListItemButton style={{ fontFamily: "Arial" }} onClick={handleClick}>
            Settings
          </ListItemButton>
          <ListItemButton style={{ fontFamily: "Arial" }} onClick={handleClick}>
            User Management
          </ListItemButton>
          <ListItemButton style={{ fontFamily: "Arial" }} onClick={handleClick}>
            ATM Management
          </ListItemButton>
          <ListItemButton style={{ fontFamily: "Arial" }} onClick={handleClick}>
            My account
          </ListItemButton>
        </List>
      </Drawer>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Feature not implemented
        </Alert>
      </Snackbar>
    </div>

  );

}
export default SideBar;