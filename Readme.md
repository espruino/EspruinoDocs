<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Quick Start
==========


Start writing code!
--------------------------

Set up in-app Billing on your app. Use class IabHelper

@base64EncodedPublicKey is your license key in app on Google Play

Ex: String base64EncodedPublicKey = "bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ";

```
  IabHelper mHelper;

  mHelper = new IabHelper(this, base64EncodedPublicKey);
    
    	mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {

			@Override
			public void onIabSetupFinished(IabResult result) {
				if (!result.isSuccess()) {
					Log.d(TAG, "In-app Billing setup failed: " + result);
				} else              
					Log.d(TAG, "In-app Billing is set up OK");
			}
  });
```

Next, you need get your ANDROID_ID on device 

```
Ex: android_id = Secure.getString(getBaseContext().getContentResolver(),Secure.ANDROID_ID);
```

Resister your divice with sever 
```
  ServerConnect.setDeviceId(AndroidBillingActivity.this, android_id); 
```

Get object list to server
@appId: is app's Id that you wanna manage
Return server: name, appid, objectid, createtime (return result type JSONObject)
```
String objList = ServerConnect.setAppId(appId);
```

Note: You must register your divice with sever  before get object list

To purchase on Google Play you call mHelper's lauchPurchaseFlow() method 

@Context is activity's context
@objectID is SKU saved on server
mPurchaseFinishedListener is event listener when Google Play response

```
  mHelper.launchPurchaseFlow(Context, objectId, 10001, mPurchaseFinishedListener, "");
  
  IabHelper.OnIabPurchaseFinishedListener mPurchaseFinishedListener 
						                  = new IabHelper.OnIabPurchaseFinishedListener() {
		@Override
		public void onIabPurchaseFinished(IabResult result, Purchase purchase) {
			if (result.isFailure()) {
				// Handle error
				return;
			} else if (purchase.getSku().equals(objectId)) {
				ServerConnect.buyObject(objectid)
			}     
		}
	};
```
When purchase success call ServerConnect.buyObject(objectid) method notify with server

To consume item on Google Play you call mHelper's queryInventoryAsync() method 
```
  mHelper.queryInventoryAsync(mReceivedInventoryListener);
```
This is method event listener mReceivedInventoryListener to Google Play
```
  IabHelper.QueryInventoryFinishedListener mReceivedInventoryListener 
								= new IabHelper.QueryInventoryFinishedListener() {
		@Override
		public void onQueryInventoryFinished(IabResult result, Inventory inventory) {
			if (result.isFailure()) {
				// Handle failure
			} else {
				mHelper.consumeAsync(inventory.getPurchase(objectId), mConsumeFinishedListener);
			}
		}
	};
	
	IabHelper.OnConsumeFinishedListener mConsumeFinishedListener =
								new IabHelper.OnConsumeFinishedListener() {
		public void onConsumeFinished(Purchase purchase, IabResult result) {
			if (result.isSuccess()) {		 
			      // Consume Success
			} else {
		         // handle error
			}
		}
	};
```

When the purchasing process returns, it will call a method on the calling activity named onActivityResult, 
passing through as arguments the request code passed through to the launchPurchaseFlow method, 
a result code and intent data containing the purchase response. This method needs to identify if it was 
called as a result of an in-app purchase request or some request unrelated to in-app billing. 
It does this by calling the handleActivityResult method of the mHelper instance and passing through the 
incoming arguments. If this is a purchase request the mHelper will handle it and return a true value. 
If this is not the result of a purchase, then the method needs to pass it up to the superclass to be handled. 
```
  @Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (!mHelper.handleActivityResult(requestCode, resultCode, data)) 
			super.onActivityResult(requestCode, resultCode, data);
	}
```

Throughout this tutorial, much of the work has been performed by calling methods on an 
instance of the IabHelper utility class named mHelper. Now that the code to handle purchasing 
and subsequent consumption of a virtual item is complete, the last task is to make sure this 
object is released when activity is destroyed. 
```
	@Override
	public void onDestroy() {
		super.onDestroy();
		if (mHelper != null) 
			mHelper.dispose();
		mHelper = null;
	}
```
