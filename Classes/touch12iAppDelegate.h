//
//  touch12iAppDelegate.h
//  touch12i
//
//  Created by Elvis Pfützenreuter on 8/29/11.
//  Copyright 2011 Elvis Pfützenreuter. All rights reserved.
//

#import <UIKit/UIKit.h>

@class touch12iViewController;

@interface touch12iAppDelegate : NSObject <UIApplicationDelegate>;

@property (strong, nonatomic) UIWindow *window;
@property (strong, nonatomic) touch12iViewController *viewController;

@end

