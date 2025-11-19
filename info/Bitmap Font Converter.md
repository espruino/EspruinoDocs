<!--- Copyright (c) 2025 Matt Brailsford & Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Bitmap Font Converter
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Bitmap+Font+Converter. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Font,Create,Convert,Bitmap
* USES: Graphics

<style>
h1 { display:none;}
.topthumbnail { display:none;}
body #form * { all: revert; }
body #form { width: 500px; margin: 20px auto; }
body #form fieldset { border: solid 1px #ccc; margin-bottom: 20px; }
body #form legend { font-weight: bold; }
body #form table { width: 100%; }
body #form td { white-space: nowrap; }
body #form input[type=text], input[type=file], input[type=number], button, textarea { width: 100%; }
body #form textarea { height: 200px; }
body #form button { cursor: pointer; }
</style>
<form id="form">
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABsCAIAAAAT9tdHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RURDQUU2ODZDMzM4MTFFM0E3NjBGOTc0MzlBQTJEOEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RURDQUU2ODdDMzM4MTFFM0E3NjBGOTc0MzlBQTJEOEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFRENBRTY4NEMzMzgxMUUzQTc2MEY5NzQzOUFBMkQ4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFRENBRTY4NUMzMzgxMUUzQTc2MEY5NzQzOUFBMkQ4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pta1H9kAAAkjSURBVHja7N07jtRKGEBhg26GRAhIEF0JEAkTISGSkYYAEhIkEAsgm5AlQEqINGsgJEBEI80SGCK2QMgGuC0stXxd5XJ1t8t2u78TjHq6/aiHffy7qly+8ufPnwoAsCyukDsAkDsAgNwBAOQOACB3AAC5AwC5AwDIHQBA7gAAcgcAkDsAkDu5AwC5AwDIHQBA7gAAcgcAkDsAkDsAgNwBAOQOACB3AAC5AwC5kzsAkDt6y/TKlZH32FWJB5KS/GN4JslIp2SXU3KLze7FQXKwZULu5E7u5E7u5L4sua+qYZWF5l9yJ3dyJ3dy3ye51yVeS3xdIuHnyXNE7uRO7uRO7j3xeCv/TX234vSm+qfNFLmTO7mTO7mnPB6VeHOt9Kamyhq5kzu5k/uhyL3VMh4Nxls2b+o72rCelv6E8Tu5kzu5k/uS5R4aOaHvlo6bl4HWl73inrx9htxnmxIiW9JBkllQ5F7KcdEml+gFICH9KmhnTw+Pmdbvhc5bKdl9s3uh1JFTMlTUUnr7M5H7bGtn7GaZlmTTrSvpVpct2lumGjxD7uRO7uS+cLmH8XtC610e710+3Sg0vsvIndzJndyXH7mntV51N83nLJOz92r0zlVyJ3dyJ/eDiNxb42TWwu3NUm/Deo7fx9cZuZM7uZP78uUeGjbaCBO2zlfBOJnoT5lXlzHjd3Ind3In94OQeytviaaVrqaYqKY37VltXl2KFu4g46gGSY+hkPtYIOQ+bIGTe3GtRycPSDfHdxk/v1kmemkpHcWTO7mTe9HEb5RNch/V7111EAbmXY31G5VOdMaxqtiMkuRO7uRO7gfXLJM5MCYa2rfKIiyp/MdWEwPwyZ3cyZ3cyX3X9pnorGG7n0vRu4R0f+yAfid3cid3cj9cuXdNxd57AKWfem0tGe6lawvD5pHcyZ3cyf2w5N7MYVrlvQF+Qt+JSFzkTu7kTu7kPl78nhPIt9xdbTI1WG/bug5Vcid3cif3weQebWCpOl66lJhCMjqDTdU3Z1khv5M7uZP7VHI/2NqZi9yrWJ9n5sxi+WruapOJHivjjJbZ99eRzy0UGrlqBrQbuY9cO+Q+pS9yZoLsita7xsPkv8JpPgYhd3Ind3JfiNzTEXpO/J7wdfTVH0WDd3Ind3Ind3KPKLj3ZaqhjtNjHEXu5E7u5E7u84rfe9XfG6fnvJd12NfykTu5kzu5k3vK75sOmImOkow271Tdkw+L3Mmd3Mmd3Id0evqte/mzRaaD/ar7UdURDFKIvX6x/WLkvryq2a+DZJG1s+TIPdHCXsVm8e1twOl6zLWa2Th35+0M5T7OrYyDRO0sSu6bhueJ13rk+D1nKjFyJ3dyJ3dyL2L53imCEw04iZHyXaUpcid3cid3ci8YtmcOOc+ZIyxT/drcyZ3cyZ3cyyq+6mgiTz+SmjPGprnBEjP9Om/JndzJndz7/V5lvIqv98uNZqchd3Ind3In91Jar/qePMqZomDM7lPnLbmTO7mTe38dbDF0vfe51vH9DgATG3WGzTKJR0nzx8P0Tiqp7gGQ+66a3mitRBieOb9YYlPCdgDkvqXWm/9mbj+nU7S1ZNU3UUF6Lnh+B0Du28t9C79XfSPfeychELkDIPd5yT2ndWXTl3skLgYAQO4b+L35oP92ft+0mzRxnQhf6LFRqgCA3LcM3jed5rdr+da++D2fy8vLnz9/1p+Pj49v3LihTIA95k8ZttvX2raJL1sfwu8zfypXAr1l/vnz501XWfP9+/fdV/n48WOY7FWqwlUKpS0sgRLlPFWhbbGXpZZAdJVv374Nm7CiJ9qcT4E0V4teNnZZsY6vw+C9N0LvSsD6p+Y2Re4AFkkpuacn1+1qxqnXarq7NV9Y83Nz4y3jNxduJaB1DRj/OeM58O7du7p8Li8v60JY8fr1a+dDfqEpAcycf4pG7uvoOwyZo6H6+o6m2UTe/NBcLD3be9d2Brm3yOTNmzcvX75sffnjx4+1Rlc3cQ8fPqzv0ZrLnJ2dnZ+frz7cu3fvw4cPzZ9u3bq1vq2LrhL+tF6lUHbev3+/ewkMnrB0CWyRl3xmUjUTlsBM8pJ/omVWzWxPgbHl3hWk58zSnjB1q6O1+W8YxSe2M0JmHz169OrVq9aX169fD5dsLXZxcVEfc3fu3Am3kF4l/Gn87OyyylAJGzwv+cykaiYsgdnmZceqme0pMGqzTCI07n2HerRJvavtpXWL0NJ6eOtQjdjOvr6NbfL8+fPJz59VNLGKU1Z/j46O6jJZ/Xt6ejp4dsYpgdZenj59Wq7QTk5O6kIrtJc5M04JbFGbsz3Rpk3b1dI7yDdpKOuun5p9rWHr+boE0y9mOmTqaGL1txnRHB8fK5neQnvw4IEScDDsBVcn2WtX8B76PdR3s/W8a0RNzi0CACyYMdrcEyF52PDSjLLDjtDEG5q6djrtbew8+6xqHj9+3OpEGjw7W3SODVXOhXjx4sXqFuf3799v3749zOghpwTq42p1bLz7S/W323BV1zdv3qwXOD09re8UM3tH8w+AOmG9e5lEAiOnbaQO1dbYxHTrTW9UHm20adk8/Gaq29jWl3Pos6p58uRJ6exs0Tk2VDkX4tmzZ6u/v379Oth4MKcE6upIHBsrr3VV2Y4dqs2EJfYyiQRGTttIcg/fc52YyHfTqDzq8Wan61RN7euwpUV40e66CJ2fn7d+Kjdw6qDoqppMrl27VgenFxcXnz59mn92wsNmhBK4e/duvczZ2dnR0VG5vEQTVmK44VCFtqihkOsxiL1D3aMej8bg0Vli9mL2mDkEFNiF1Vm6rsE5yH2eJfDvX6rGiMOTk5MvX758/fr1/v37pRM2n1vkqdI26jj3Xs9GRzemzR5VuVExwPyvCliO3DMvAGHrfFTls50fpreXMgxb8js2u7pf6m6uzITdvn07mqr1As29pNda33pXsadno6sMXs75e9minLcrtE2rptCRlsjO3Epg8IRFj8ztqmaStO3OHId+509KAwDYG7kDAMgdAEDuAEDuAAByBwCQOwCA3AEA5A4A5A4AIHcAALkDAMgdAEDuAAByBwByBwCQOwCA3AEA5A4AIHcAIHcAALkDAMgdAEDuAAByBwD8n/8EGACo3EaRMtNDOwAAAABJRU5ErkJggg==" alt="Espruino - Bitmap Font Converter">
  <br><br>
  <fieldset>
    <legend>Input</legend>
    <table>
      <tr>
        <td><label for="fuImage">Bitmap image</label></td>
        <td><input type="file" id="fuImage" accept=".bmp,.png,.jpg,.jpeg"></td>
      </tr>
      <tr>
        <td><label for="txtFirstChar">First char (eg 'A')</label></td>
        <td><input type="text" id="txtFirstChar" maxlength="1"></td>
      </tr>
      <tr>
        <td><label for="txtCharWidth">Char width</label></td>
        <td><input type="number" id="txtCharWidth"></td>
      </tr>
      <tr>
        <td><label for="txtCharHeight">Char height</label></td>
        <td><input type="number" id="txtCharHeight"></td>
      </tr>
      <tr>
        <td><label for="txtCharSpacing">Character spacing</label></td>
        <td><input type="number" id="txtCharSpacing" value="1"></td>
      </tr>
      <tr>
        <td><label for="chkFixedWidth">Fixed width</label></td>
        <td><input type="checkbox" id="chkFixedWidth"></td>
      </tr>
    </table>
    <button type="button" id="btnConvert">Convert</button>
  </fieldset>
  <fieldset>
    <legend>Output</legend>
    <textarea id="txtOutput" readonly></textarea>
  </fieldset>
  <fieldset>
    <legend>Information</legend>
    <p>This tool converts a bitmap image of a font into JavaScript code that can be used with Espruino. It was developed by <a href="https://mattbrailsford.dev">Matt Brailsford</a> and was originally available at ebfc.mattbrailsford.com.</p>
    <p>The image you supply should contain characters arranged in a grid, in <a href="https://en.wikipedia.org/wiki/ASCII#Character_set">ASCII order</a> and then all you need to do is enter the first character, and the width/height of each cell in the grid.</p>
    <p>For example you could upload <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAGAQMAAACl02/6AAAAwnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVDbDcMgDPxnio7gF2DGIU0qdYOOX4OdKrQ9icP40PmRjtfzkW4DhJIkVy2tFDBIk0bdAgVHn4wgkyf4Hhqu+QQlBLIUj5/+1MjjmcePgV/donwx0qiA2yo0CX/9MqLobHQ04j2MWhgxuYBh0H0sKE3rdYTtgBXqJw0SXdv+eVfb3p6tDhMdjAzGzMUb4HFy4m4CTq720WNiMWZuYWYL+benE+kNLZNZSaf5ijUAAAGEaUNDUElDQyBwcm9maWxlAAB4nH2RPUjDUBSFT1OlohURC4o4ZKhOdqkijrUKRagQaoVWHUxe+gdNGpIUF0fBteDgz2LVwcVZVwdXQRD8AXEXnBRdpMT7kkKLWB9c3sd57xzuuw8Q6mWmWV0xQNNtM5WIi5nsqhh4RR8GqYYRlZllzElSEh3X1z18fL+L8KzO9/5c/WrOYoBPJI4xw7SJN4hnNm2D8z5xiBVllficeNKkBokfua54/Ma54LLAM0NmOjVPHCIWC22stDErmhrxNHFY1XTKFzIeq5y3OGvlKmv2yV8YzOkry1ynGkMCi1iCBBEKqiihDBsR2nVSLKToPN7BP+r6JXIp5CqBkWMBFWiQXT/4H/yerZWfinpJwTjQ/eI4H+NAYBdo1Bzn+9hxGieA/xm40lv+Sh2Y/SS91tLCR8DANnBx3dKUPeByBxh5MmRTdiU/lZDPA+9n9E1ZYOgW6F3z5tY8x+kDkKZZJW+Ag0NgokDZ6x3e3dM+t3/vNOf3A7f6csJix682AAANeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo1MmY4Njc5ZC1kYTg4LTQyMWYtYWE4ZC0wYjQwYjBiYjI4Y2YiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MWNmYzU1ODUtNjI1YS00OTAzLWIyNmYtMzk0N2NkZjhiMDVhIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MzFiMjJhZTUtNWJhMC00MzI4LTgzYzAtMTAwZmFlY2E4MzA2IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iTGludXgiCiAgIEdJTVA6VGltZVN0YW1wPSIxNzYzMzc4NjgxNjAyMjk3IgogICBHSU1QOlZlcnNpb249IjIuMTAuMzYiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1OjExOjE3VDExOjI0OjM5KzAwOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyNToxMToxN1QxMToyNDozOSswMDowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlmZWU0YmY5LTRkMTYtNGNkOS05ZjkzLTNjY2QzYWQ5OThiZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChMaW51eCkiCiAgICAgIHN0RXZ0OndoZW49IjIwMjUtMTEtMTdUMTE6MjQ6NDErMDA6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+OarbeAAAAAZQTFRFAAAA////pdmf3QAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfpCxELGCmuFg7VAAAAQUlEQVQI1wE2AMn/AI944+wcwY4wAGZ3Xc37/XXQAFV/c6ww+43QAFd4/W/Xd3YQADd33QXXb3fQAIwQY+44744w3r8aLyNFSS0AAAAASUVORK5CYII=" style="padding:2px;border:1px solid black;"/>
with a First char of <code>0</code>, Char width of <code>6</code> and Char height of <code>6</code> to get a font containing the digits 0-9. 'Character spacing' is the space that will be added between characters.</p>
  </fieldset>
  <!-- Hidden canvas used for pixel access -->
  <canvas id="canvas" style="display:none;"></canvas>
</form>
<p>

</p>

<script>
// converter.js

document.getElementById('btnConvert').addEventListener('click', onConvertClick);

const validFileExtensions = [".bmp", ".jpg", ".jpeg", ".png"];

function onConvertClick() {
  const output = document.getElementById('txtOutput');
  output.value = "";

  const fileInput = document.getElementById('fuImage');
  const firstCharInput = document.getElementById('txtFirstChar');
  const charWidthInput = document.getElementById('txtCharWidth');
  const charHeightInput = document.getElementById('txtCharHeight');
  const charSpacingInput = document.getElementById('txtCharSpacing');
  const fixedWidthInput = document.getElementById('chkFixedWidth');

  // Validation
  if (!fileInput.files || fileInput.files.length === 0) {
    output.value = "[ERROR] No file selected";
    return;
  }

  const file = fileInput.files[0];
  const extMatch = file.name.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";

  if (!validFileExtensions.includes(ext)) {
    output.value = "[ERROR] Invalid file extension. Valid extensions are " + validFileExtensions.join(",");
    return;
  }

  const charWidth = parseInt(charWidthInput.value, 10);
  const charHeight = parseInt(charHeightInput.value, 10);
  const charSpacing = parseInt(charSpacingInput.value, 10);

  if (isNaN(charWidth) || isNaN(charHeight)) {
    output.value = "[ERROR] Char Width and/or Char Height are not valid numbers";
    return;
  }

  if (!firstCharInput.value || firstCharInput.value.length < 1) {
    output.value = "[ERROR] First char is required";
    return;
  }

  const firstCharCode = firstCharInput.value.charCodeAt(0);
  const fixedWidth = fixedWidthInput.checked;

  // Load image into an <img>, then draw to <canvas> and process
  const img = new Image();
  img.onload = function () {
    try {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data; // [r,g,b,a, r,g,b,a,...]

      function getBrightness(x, y) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const avg = (r + g + b) / 3;
        return avg / 255; // 0..1
      }

      const bits = [];
      const charWidths = [];

      let x = 0;
      let y = 0;

      while (y < img.height) {
        let startX = charWidth;
        let endX = 0;

        if (fixedWidth) {
          startX = 0;
          endX = charWidth - 1;
        } else {
          // Calculate char width
          for (let cx = 0; cx < charWidth; cx++) {
            let set = false;
            for (let cy = 0; cy < charHeight; cy++) {
              const colBrightness = getBrightness(cx + x, cy + y);
              if (colBrightness < 0.5) {
                set = true;
                break;
              }
            }
            if (set) {
              if (cx < startX) startX = cx;
              endX = cx;
            }
          }

          // Pad certain characters with spacing
          if (startX > endX) {
            startX = 0;
            endX = Math.floor(charWidth / 2); // treat space as half-width
          } else if (endX < charWidth - 1) {
            endX += charSpacing; // if not full width, add a space after
          }

          charWidths.push(endX + 1 - startX);
        }

        // Add to bits collection
        for (let cx = startX; cx <= endX; cx++) {
          for (let cy = 0; cy < charHeight; cy++) {
            const brightness = getBrightness(cx + x, cy + y);
            bits.push(brightness < 0.5);
          }
        }

        // Move to next character block
        x += charWidth;
        if (x >= img.width) {
          x = 0;
          y += charHeight;
        }
      }

      // Convert bits -> bytes
      const imageBytes = [];
      for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let bit = 0; bit < 8; bit++) {
          if (bits[i + bit]) {
            b += 1 << (7 - bit);
          }
        }
        imageBytes.push(b);
      }

      // JS helper: byte array -> base64
      function bytesToBase64(bytes) {
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }

      let result = "";
      result += `var font = atob("${bytesToBase64(imageBytes)}");\n`;

      if (fixedWidth) {
        result += `g.setFontCustom(font, ${firstCharCode}, ${charWidth}, ${charHeight});`;
      } else {
        const widthsBytes = Uint8Array.from(charWidths);
        result += `var widths = atob("${bytesToBase64(widthsBytes)}");\n`;
        result += `g.setFontCustom(font, ${firstCharCode}, widths, ${charHeight});`;
      }

      output.value = result;
    } catch (e) {
      output.value = "[ERROR] " + e.message;
    }
  };

  img.onerror = function () {
    output.value = "[ERROR] Failed to load image";
  };

  // Read file to object URL
  const url = URL.createObjectURL(file);
  img.src = url;
}
</script>
