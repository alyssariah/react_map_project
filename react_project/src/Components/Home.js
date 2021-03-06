import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import "./CSS/Home.css"
import Form from "./Form"


function Home(props){
    //setting state
    const [driverAlert, setDriverAlert] = useState("")
    const [alert, setAlert] = useState("")
    const [showInfo, setShowInfo] = useState(false)


    //fetching data from google sheet
    const pullGoogleSheet = async() => {
        let sheetUrl = "https://spreadsheets.google.com/feeds/list/1uZdRKonnGEAgksvHTd9g6FKBkiQyzk9vf6u2ec7LEdE/od6/public/values?alt=json"
        let res = await fetch(sheetUrl)
        let data = await res.json()
        let object = await data.feed.entry
        const dataArr = object.map((obj, index) => {
            if(obj.gsx$title.$t === "Driver"){
                return {name: obj.gsx$name.$t, address: obj.gsx$address.$t, title: "driver"}
              
            } else {
                return {name: obj.gsx$name.$t, address: obj.gsx$address.$t, title: "passenger"}
            }
        })
        const driverArr = dataArr.filter((driver)=>{
            return driver.title === "driver"
        })
        const driverData = driverArr.map(async(driver, index)=>{
            let str = driver.address.replace(/\s/g, '+');
            let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${str},+CA&key=AIzaSyDJ56l2Y_6K3vN5rH30aKddRVljnEsuR_Y`)
            let json = await res.json();
            let place = json.results[0].geometry.location
            return {name: driver.name, address: driver.address, lat: place.lat, lng: place.lng, assigned:"unassigned"}
        })
        const rideArr = dataArr.filter((ride)=>{
            return ride.title === "passenger"
        })
        const rideData = rideArr.map(async(ride, index)=>{
            let str = ride.address.replace(/\s/g, '+');
            let res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${str},+CA&key=AIzaSyDJ56l2Y_6K3vN5rH30aKddRVljnEsuR_Y`)
            let json = await res.json();
            let place = json.results[0].geometry.location
            return {name: ride.name, address: ride.address, lat: place.lat, lng: place.lng, assign: "unassigned"}
        })
        const resolvedDriverArray = await Promise.all(driverData); 
        const resolvedRideArray = await Promise.all(rideData)
       
        props.setDriverList(resolvedDriverArray)
        props.setRideList(resolvedRideArray)
    }
    
    //removing item from list 
    const removeDriver = (name) => {
        props.driverList.forEach((object, index) => {
            if(name === object.name){
                props.driverList.splice(index, 1)
                setDriverAlert(
                    <div className="alert">
                        <img className="removeIcon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Remove_sign_font_awesome.svg/512px-Remove_sign_font_awesome.svg.png"/>
                        <p>{name} has been removed from your map</p>
                     </div>
                )
            }
        })
    }
    const removeRide = (name) => {
        props.rideList.forEach((object, index) => {
            if(name === object.name){
                props.rideList.splice(index, 1)
                setAlert(
                    <div className="alert">
                        <img className="removeIcon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Remove_sign_font_awesome.svg/512px-Remove_sign_font_awesome.svg.png"/>
                        <p>{name} has been removed from your map</p>
                    </div>)
            }
        })

    }

    
    //making the driver List and ride List
    const makeDriverList = props.driverList.map((obj, index) => {
        return (
            <div className="listItem">
                <img className="removeIcon" onClick ={()=> removeDriver(obj.name)} src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Remove_sign_font_awesome.svg/512px-Remove_sign_font_awesome.svg.png"/>
                <li key={index}>{obj.name} - {obj.address}</li>
            </div>
        )
    })
    const makeRideList = props.rideList.map((obj, index) => {
        return (
            <div className="listItem">
                <img className="removeIcon" onClick={()=> removeRide(obj.name)} src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Remove_sign_font_awesome.svg/512px-Remove_sign_font_awesome.svg.png"/>
                <li key={index}>{obj.name} - {obj.address}</li>
            </div>
        )
    })

    return(
        <div className="information">
            <header>
                <h2>Carpool <span>coordinator</span></h2>
                <div>
                    <img onClick={pullGoogleSheet} className="importIcon" src="https://upload.wikimedia.org/wikipedia/commons/4/4d/Font_Awesome_5_solid_file-import.svg"/>
                    <img onClick={()=>{setShowInfo(!showInfo)}}className="helpIcon" src="https://cdn1.iconfinder.com/data/icons/education-set-4/512/information-512.png"/>
                </div>    
            </header> 
            {showInfo && (<div className="instructions" onClick={()=> setShowInfo(false)}>
                <ol>
                <h4>Instructions: </h4>
                    <li>On your home page, add drivers to your driver list and passengers who need a ride to your passenger list</li>
                    <li>After you submit, check out the map by clicking on the map icon to see where your drivers and passengers are located!
                    </li>
                    <li>On the map page, click on the red passenger markers to assign them a driver and they should turn blue!</li>
                    <li>Once you assigned all your passengers a driver and your markers are all blue, click on the list icon to see the assignments</li>
                </ol>
            </div>)}
            <main>
            <div className="welcome">
                    <h4>A better way to coordinate rides!</h4>
            </div>
            <Form makeDriverList={makeDriverList}
                 makeRideList={makeRideList}
                 driverList={props.driverList}
                 setDriverList={props.setDriverList}
                 rideList={props.rideList}
                 setRideList={props.setRideList}
                 alert={alert}
                 setAlert={setAlert}
                 driverAlert={driverAlert}
                 setDriverAlert={setDriverAlert}/> 
            </main>
            <nav>
                <Link to="/"><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Home_icon_black.png"/><br/>Home</Link>
                <Link to="/map"><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/e/ed/Map_pin_icon.svg"/><br/>Map</Link>
                <Link to="/list"><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/4/43/Noun_project_list_icon_1380018_cc.svg"/><br/>Assign</Link>
            </nav>  
            <div className="nav">
                <Link to="/"><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Home_icon_black.png"/></Link>
                <Link to="/map"><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/e/ed/Map_pin_icon.svg"/></Link>
                <Link to="/list"><img className="logo" src="https://upload.wikimedia.org/wikipedia/commons/4/43/Noun_project_list_icon_1380018_cc.svg"/></Link>
            </div>           
            <footer>&copy; Carpool Coordinator 2020</footer>
        </div>
    )
}
export default Home;