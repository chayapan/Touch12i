//
//  touch12iViewController.h
//  touch12i
//
//  Created by Elvis Pfützenreuter on 8/29/11.
//  Copyright 2011 Elvis Pfützenreuter. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioToolbox.h>

@interface touch12iViewController : UIViewController <UIWebViewDelegate> {
    SystemSoundID audio_id, audio2_id;
    int click;
    int comma;
    IBOutlet UIWebView *html;
    int layout;
    int old_layout;
    BOOL splash_fadedout;
    int lock;
    BOOL iphone5;
}

- (void) playClick;
- (BOOL) webView:(UIWebView *)view shouldStartLoadWithRequest:(NSURLRequest *)request 
  navigationType:(UIWebViewNavigationType)navigationType;


@end

