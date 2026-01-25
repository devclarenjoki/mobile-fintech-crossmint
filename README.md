# Crossmint Mobile Fintech

A React Native wallet application built with Expo, featuring seamless authentication, balance tracking, and USDC transfers via the Crossmint SDK.

## Features
+ **Secure Authentication**: Built-in Crossmint email-based login.
+ **Real-time Balance**: USDC balance tracking with optimized error handling.
+ **Send & Receive**: Intuitive UI for transferring USDC.
+ **Bank-App UI**: Clean, dark-mode compatible interface with "Max" buttons and validation.
+ **Transaction Simulation**: "Staging Fund" button for testing balance updates.

## Prerequisites
Before you begin, ensure you have the following installed:

+ Node.js (LTS version recommended)
+ bun or yarn or npm
+ Expo Go (on your mobile device) OR an Android/iOS emulator.

## Installation 

1. Install dependencies

   ```bash
   bun install
   ```

2. Environment Setup
This project requires a Crossmint API Keys to function.
Create a .env file in the root of your project

      ```bash
   EXPO_PUBLIC_API_CLIENT_KEY=
   EXPO_PUBLIC_API_SERVER_KEY=

   ```

3. Start the app

   ```bash
   bun expo start
   ```






