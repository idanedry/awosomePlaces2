import { Component } from '@angular/core';
import {NgForm} from "@angular/forms";
import {ModalController, LoadingController, ToastController} from "ionic-angular";
import {SetLocationPage} from "../set-location/set-location";
import {Location} from "../../models/location";
import {PlacesService} from "../../services/places";
import {Camera} from "@ionic-native/camera";
import {File} from "@ionic-native/file";
import {Geolocation} from "@ionic-native/geolocation";

declare var cordova : any;

@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {

    location: Location = {
        lat: 40.7624324,
        lng: -73.9759827
    };
    locationIsSet = false;
    imageUrl = '';

    constructor(private modalCtrl: ModalController,
                private loadingCtrl: LoadingController,
                private toastCtrl: ToastController,
                private placesService: PlacesService,
                private geolocation : Geolocation,
                private file: File,
                private camera: Camera){}

    onSubmit(form: NgForm){
        this.placesService.addPlace(form.value.title,form.value.description, this.location, this.imageUrl);
        form.reset();
        this.location = {
            lat: 40.7624324,
            lng: -73.9759827
        };
        this.imageUrl = '';
        this.locationIsSet = false;
    }

    onOpenMap(){
        const modal = this.modalCtrl.create(SetLocationPage, {location:this.location , isSet: this.locationIsSet});
        modal.present();
        modal.onDidDismiss(
            data => {
                if(data) {
                    this.location = data.location;
                    this.locationIsSet = true;
                }
            }
        );
    }
    onLocate(){
        const loader = this.loadingCtrl.create({
            content: 'Getting your location...'
        });
        loader.present();
        this.geolocation.getCurrentPosition()
            .then(
                location => {
                    loader.dismiss();
                    this.location.lat = location.coords.latitude;
                    this.location.lng = location.coords.longitude;
                    this.locationIsSet = true;
                }
            )
            .catch(
                error => {
                    loader.dismiss();
                    const toast = this.toastCtrl.create({
                        message:' Could not get location, please pick it manually',
                        duration: 2500
                    });
                    toast.present();
                    console.log(error)
                }
            );
    }

    onTakePhoto(){
        this.camera.getPicture({
            encodingType: this.camera.EncodingType.JPEG,
            correctOrientation : true
        })
            .then(
                imageData => {
                    const currentName = imageData.replace(/^.*[\\\/]/, '');
                    const path = imageData.replace(/[^\/]*$/, '');
                    const newFileName = new Date().getUTCMilliseconds + '.jpg';
                    this.file.moveFile(path, currentName, cordova.file.dataDirectory, newFileName)
                        .then(
                            (data) => {
                                this.imageUrl = data.nativeURL;
                                this.camera.cleanup();
                            }
                        )
                        .catch(
                            (err) => {
                                this.imageUrl = '';
                                const toast = this.toastCtrl.create({
                                    message: 'Could not save the image...',
                                    duration : 2500
                                });
                                toast.present();
                                this.camera.cleanup();
                            }
                        )
                    this.imageUrl = imageData;
                }
            )
            .catch(
                error => {
                    const toast = this.toastCtrl.create({
                        message: 'Could not take the image...',
                        duration : 2500
                    });
                    toast.present();
                }
            );
    }
}
