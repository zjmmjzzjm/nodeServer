[Code]
//модуль для работы с ProgressBar'ами. для работы требует подключения botva2.iss
//не рекомендуется для работы в реальных приложениях
//Created by South.Tver 02.2010
  
type
  TImgPB = record
    Left,
    Top,
    Width,
    Height,
    MaxWidth  : integer;
    img1,img2,img3 : Longint;
    //hParent   : HWND;
  end;

//создать прогрессбар
function ImgPBCreate(hParent :HWND; bk, pb :ansistring; Left, Top, Width, Height :integer):TImgPB;
begin
  Result.Left:=Left;
  Result.Top:=Top;
  Result.Width:=0;
  Result.Height:=Height;
  Result.MaxWidth:=Width;
  if Length(bk)>0 then Result.img2:=ImgLoad(hParent,bk,Left,Top+1,Width,Height,True,True) else Result.img2:=0;
  if Length(pb)>0 then
    begin
      Result.img1:=ImgLoad(hParent,pb,Result.Left+1,Result.Top,0,Result.Height,True,True);
      Result.img3 := ImgLoad(hParent,pb,Result.Left+1,Result.Top,0,Result.Height,True,True);
    end
  else
  begin
   Result.img1:=0;
   Result.img3:=0;
  end
  
    

  //Result.hParent:=hParent;
  //if (Result.img1<>0) or (Result.img2<>0) then ImgApplyChanges(hParent);
end;

//установить позицию прогрессбара (0-1000)
procedure ImgPBSetPosition(var PB :TImgPB; Percent :Extended);

var
  NewWidth:integer;
  gap, leftgap, mid:integer;
begin
  gap := 46;
  leftgap := 40;
  mid := 20;
  if PB.img1<>0 then begin
    NewWidth:=Round(PB.MaxWidth*Percent/1000);
    if PB.Width<>NewWidth then begin
      PB.Width:=NewWidth;
      
      if (PB.Width  >=  leftgap) and (PB.Width  <  PB.MaxWidth-gap) then
        begin
          ImgSetPosition(PB.img1,PB.Left,PB.Top,PB.Width,PB.Height);
          ImgSetVisiblePart(PB.img1, 0, 0, PB.Width, PB.Height);
          ImgSetPosition(PB.img3,PB.Left + PB.Width,PB.Top, gap ,PB.Height);
          ImgSetVisiblePart(PB.img3, PB.MaxWidth-gap, 0, gap, PB.Height);
        end
      else if   (PB.Width  <  leftgap) and (PB.Width >= mid) then
        begin
          ImgSetPosition(PB.img1,PB.Left,PB.Top,PB.Width,PB.Height);
          ImgSetVisiblePart(PB.img1, 0, 0, PB.Width, PB.Height);

          ImgSetPosition(PB.img3,PB.Left + PB.Width,PB.Top, PB.Width ,PB.Height);
          ImgSetVisiblePart(PB.img3, PB.MaxWidth- mid - ( PB.Width - mid), 0, PB.Width, PB.Height);
        end
      else if (PB.Width  <  mid) then
      begin
          ImgSetPosition(PB.img1,PB.Left,PB.Top,PB.Width,PB.Height);
          ImgSetVisiblePart(PB.img1, 0, 0, 0, 0);
          
          ImgSetPosition(PB.img3,PB.Left,PB.Top, PB.Width ,PB.Height);
          ImgSetVisiblePart(PB.img3, PB.MaxWidth- mid - ( PB.Width - mid), 0, 0, 0);
      end
      else
        begin
          ImgSetPosition(PB.img1,PB.Left,PB.Top,PB.MaxWidth-gap,PB.Height);
          ImgSetVisiblePart(PB.img1, 0, 0, PB.MaxWidth-gap, PB.Height);
          ImgSetPosition(PB.img3,PB.MaxWidth-gap,PB.Top, gap ,PB.Height);
          ImgSetVisiblePart(PB.img3, PB.MaxWidth-gap, 0, gap, PB.Height);
        end

      //ImgApplyChanges(PB.hParent);
    end;
  end;
end;

//procedure ImgPBSetPosition(var PB :TImgPB; Percent :Extended);
//var
//  NewWidth:integer;
//begin
//  if PB.img1<>0 then begin
//    NewWidth:=Round(PB.MaxWidth*Percent/1000);
//    if PB.Width<>NewWidth then begin
//      PB.Width:=NewWidth;
//      ImgSetPosition(PB.img1,PB.Left,PB.Top,PB.Width,PB.Height);
//      //ImgApplyChanges(PB.hParent);
//    end;
//  end;
//end;

//получить позицию прогрессбара (0-1000)
function ImgPBGetPosition(PB :TImgPB):Integer;
begin
  if (PB.img1<>0) and (PB.MaxWidth<>0) then Result:=PB.Width*1000/PB.MaxWidth else Result:=0;
end;

//удалить прогрессбар
procedure ImgPBDelete(var PB :TImgPB);
begin
 if (PB.img2<>0) then ImgRelease(PB.img2);
 if (PB.img1<>0) then ImgRelease(PB.img1);
  //if (PB.img1<>0) or (PB.img2<>0) then ImgApplyChanges(PB.hParent);
  PB.img1:=0;
  PB.img2:=0;
end;

//Скрыть прогрессбар
procedure ImgPBVisibility(var PB :TImgPB;Visible :boolean);
begin
  ImgSetVisibility(PB.img1,Visible);
  ImgSetVisibility(PB.img2,Visible);
  ImgSetVisibility(PB.img3,Visible);
end;