<?php

class Pressence {
   protected $db;
    
    public function __construct() {
	global $netsync_db;
	$this->db = $netsync_db;
    }

    /**
    * Set presence of user online
    * @access       public
    * @param        string
    * @param        ICometManager instance
    * @return       void
    * @todo         Return true/false
    */

    public function markOnline($from, $cometManager) {
        /*
	$sql = "INSERT INTO `pressence` (`who`, `since`) VALUES ('".mysql_real_escape_string($from)."', '".time()."');";
	mysql_query($sql);
	if(!mysql_error()) {
	    $cometManager->send($from, new BasicChannel('pressence'), '1');
	}
        */
    }

    /**
    * Unset presence of user online
    * @access       public
    * @param        string
    * @param        ICometManager instance
    * @return       void
    * @todo         Return true/false
    */
    public function markOffline($from, $cometManager) {
        /*
	//$sql = "DELETE FROM `pressence` WHERE `who` = '".mysql_real_escape_string($from)."' LIMIT 1";
        $sql = "UPDATE `pressence` SET `loggedIn` = '0' WHERE `pressence`.`who` = '".mysql_real_escape_string($from)."' LIMIT 1;";
	$cometManager->send($from, new BasicChannel('pressence'), '0');
	mysql_query($sql);
        */
    }

    /**
    * Get presence of user
    * @access       public
    * @param        string
    * @return       Boolean or timestamp
    * @todo         Best result returning object with public 2 values (success & value)
    */
    public function getOnlineSince($from) {
	$sql = "SELECT `since` FROM `pressence` WHERE `who` = '".$from."' AND `loggedIn` = '1'";
	$result = mysql_query($sql, $this->db);
	if (mysql_num_rows($result) == 0) {
	    return false;
	}
	$row = mysql_fetch_assoc($result);
	return $row['since'];
    }

    /**
    * Get presence of all users of channel
    * @access       public
    * @param        string
    * @return       Boolean or user array
    * @todo         Best result returning object with public 2 values (success & array)
    */
    public function getAllOnline($channel = false) {
	$sql = "SELECT * FROM `pressence`";
	if($channel) {
	    $sql .= "INNER JOIN subscriptions ON subscriptions.who = pressence.who AND pressence.loggedIn=1 AND subscriptions.channel = '".mysql_real_escape_string($channel)."'";
	}
	$result = mysql_query($sql, $this->db);
	if (mysql_num_rows($result) == 0) {
	    return false;
	}
	$online = array();
	while ($row = mysql_fetch_assoc($result)) {
	    $online[] = $row['who'];
	}
	return $online;
    }
}

?>