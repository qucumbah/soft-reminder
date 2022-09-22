# Soft Reminder

<table>
  <tr>
    <td>
      <img src="https://user-images.githubusercontent.com/39967396/191544464-82d3524f-704a-48bd-b086-0952ab660d78.png" />
    </td>
    <td>
      <img src="https://user-images.githubusercontent.com/39967396/191544375-6e575cde-ec2e-4c65-9f91-cbc99e4c28d4.png" />
    </td>
  </tr>
</table>

This is an alarm-like app that creates notifications at specified times.

## Check it out

[The app is available on Vercel](https://soft-reminder.vercel.app/).

## Details

### PWA

Soft Reminder is a PWA, so it will work if installed locally.

If the user is online, reminders will be synchronized with other devices.

If the user is offline, reminders will still work, and will be synchronized once the connection is restored.

### Authorization

You may use this app without authorization, but all the reminders will remain local and won't be synchronized.

Authorization is provided via GitHub OAuth.

## Limitations

Since [notification triggers API](https://bugs.chromium.org/p/chromium/issues/detail?id=891339) development is no longer pursued, there is no way to reliably create notifications in PWA unless the page is open.

So, the app has to be open at all times in order for notifications to work.

## More screenshots

<table>
  <tr>
    <td>
      <img src="https://user-images.githubusercontent.com/39967396/191546306-6d4d7ebb-b7c6-442c-a200-424be5ed011b.png" />
    </td>
    <td>
      <img src="https://user-images.githubusercontent.com/39967396/191544485-81b9e24c-6efa-4f6e-91eb-c5e3fa0836d7.png" />
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="https://user-images.githubusercontent.com/39967396/191684687-0ea0c3b3-39a0-44e3-a9fb-f441bb2226ee.png" />
    </td>
  </tr>
</table>
