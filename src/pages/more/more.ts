import { Component } from '@angular/core';
import { AlertController, App, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser'
import { TranslateService } from '@ngx-translate/core';
import { Wallet } from '../../providers/providers'


@IonicPage()
@Component({
  selector: 'page-more',
  templateUrl: 'more.html',
})
export class MorePage {

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public iab: InAppBrowser,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public wallet: Wallet
  ) {

  }
  pushAddressesPage() {
    this.navCtrl.push('AddressesPage')
  }

  pushXpubPage() {
    this.navCtrl.push('XpubPage')
  }

  async showWRP() {
    try {
      let m: string = await this.wallet.authorize()
      let a: string[] = m.split(/:(.*)/)
      let mnemonic: string = a[0]
      let passphrase: string = a[1]
      let message: string = this.translate.instant('RECOVERY_PHRASE') + ':<br>' + mnemonic + '<br><br>'
      if (passphrase) {
        passphrase = passphrase.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        message += this.translate.instant('RECOVERY_PASSPHRASE') + ':<br>' + passphrase + '<br><br>'
      }
      message += this.translate.instant('DERIVATION_PATH') + ":<br>m/44'/145'/0'"
      await this.alertCtrl.create({
        enableBackdropDismiss: false,
        title: this.translate.instant('BACKUP_WALLET'),
        message: message,
        buttons: ['ok']
      }).present()
    } catch (err) {
      if (err.message !== 'cancelled') {
        console.log(err)
      }
    }
  }

  async promptForMnemonic() {
    let recoverAlert = this.alertCtrl.create({
      enableBackdropDismiss: false,
      title: this.translate.instant('RECOVER_WALLET'),
      message: `${this.translate.instant('RECOVERY_HINT')}<br><br>(${this.translate.instant('DERIVATION_PATH')}: m/44'/145'/0')`,
      inputs: [{
        name: 'mnemonic',
        placeholder: this.translate.instant('RECOVERY_PHRASE')
      }, {
        name: 'passphrase',
        placeholder: this.translate.instant('RECOVERY_PASSPHRASE')
      }],
      buttons: [{
        text: this.translate.instant('CANCEL'),
        handler: data => {}
      },{
        text: this.translate.instant('OK'),
        handler: data => {
          if (!data.mnemonic || this.mnemonicIsValid(data.mnemonic)) {
            this.confirmDelete().then(() => {
              return recoverAlert.dismiss()
            }).then(() => {
              this.recover(data.mnemonic, data.passphrase)
            }).catch((err) => {
              console.log(err)
            })
          }
          return false
        }
      }]
    })
    await recoverAlert.present()
  }

  confirmDelete() {
    return new Promise((resolve, reject) => {
      let confirmDeleteAlert = this.alertCtrl.create({
        enableBackdropDismiss: true,
        title: this.translate.instant('WARN_DELETE_WALLET'),
        buttons: [{
          role: 'cancel',
          text: this.translate.instant('CANCEL'),
          handler: data => {
            confirmDeleteAlert.dismiss().then(() => {
              reject(new Error('cancelled'))
            })
            return false
          }
        },{
          text: this.translate.instant('OK'),
          handler: data => {
            confirmDeleteAlert.dismiss().then(() => {
              resolve()
            })
            return false
          }
        }]
      })
      confirmDeleteAlert.present()
    })
  }

  mnemonicIsValid(m: string) {
    m = m.trim()
    if (!this.wallet.validateMnemonic(m)) {
      this.alertCtrl.create({
        enableBackdropDismiss: false,
        title: this.translate.instant('ERROR'),
        message: this.translate.instant('ERR_INVALID_RECOVERY_PHRASE'),
        buttons: [this.translate.instant('OK')]
      }).present()
      return false
    } else {
      return true
    }
  }

  async recover(mnemonic?: string, passphrase?: string) {
    mnemonic = mnemonic ? mnemonic.trim() : undefined
    passphrase = passphrase ? passphrase : undefined
    let translations: string[]
    if (mnemonic) {
      translations = ['RECOVERING', 'RECOVER_SUCCESS', 'RECOVER_FAILED']
    } else {
      translations = ['CREATING', 'CREATE_SUCCESS', 'CREATE_FAILED']
    }
    let error: Error
    let loader = this.loadingCtrl.create({
      content: this.translate.instant(translations[0]) + '...'
    })
    loader.present().then(() => {
      return this.wallet.recoverWalletFromMnemonic(mnemonic, passphrase)
    }).then(() => {
      return this.app.getRootNav().setRoot('HomePage')
    }).catch((err: any) => {
      console.log(err)
      error = err
    }).then(() => {
      return loader.dismiss()
    }).then(() => {
      if (!error) {
        this.alertCtrl.create({
          enableBackdropDismiss: false,
          title: this.translate.instant('SUCCESS'),
          message: this.translate.instant(translations[1]),
          buttons: [this.translate.instant('OK')]
        }).present()
      } else {
        this.alertCtrl.create({
          enableBackdropDismiss: false,
          title: this.translate.instant('ERROR'),
          message: this.translate.instant(translations[2]),
          buttons: [this.translate.instant('OK')]
        }).present()
      }
    })
  }

  launchTwitter() {
    this.iab.create('https://twitter.com/simplycashapp', '_system')
  }

  launchTelegram() {
    this.iab.create('https://t.me/simplycashgroup', '_system')
  }

}
