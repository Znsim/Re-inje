import psycopg2
import requests
from bs4 import BeautifulSoup

#PostgrySQL 연결설정
conn = psycopg2.connect(
    host = "localhost",
    database = "Re-Inje",
    user = "postgres",
    password = "1234"
)

cur = conn.cursor()


#DB에 데이터 삽입(함수)
def insert_programs(title,start_date,end_date,link,img,facil):
    
    # 중복 확인 쿼리
    cur.execute("SELECT 1 FROM inje_iu WHERE link = %s", (link,))
    if cur.fetchone():  # 결과가 있으면 중복
        print("⚠️ 이미 존재하는 링크, 건너뜀:", link)
        return
    
    #삽입
    sql = """
    INSERT INTO inje_iu (title, start_date, end_date, link, img, facil)
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    cur.execute(sql,(title,start_date,end_date,link,img,facil))
    conn.commit()
    print("저장 완료")


def delete_expired_programs():
    cur.execute("DELETE FROM inje_iu WHERE end_date < NOW()")
    conn.commit()
    print("마감된 프로그램 삭제 완료")



url = "https://navi.inje.ac.kr/AllUsers/PreProgramList.aspx?rbtnVal=%"

#GET 메소드, url에 HTTP Request 전송
response = requests.get(url)
soup = BeautifulSoup(response.text,"html.parser")

programs = []


for li in soup.select("ul.tab-list > li"):
    # 초기화
    link_url = None
    title_text = ""
    facil_text = ""
    date_text = ""
    img_src = None
    start_date = None
    end_date = None
    d_day = 9999

    #link
    link_tag = li.select_one("a.tit")
    if link_tag:
        # onclick 속성에서 URL 추출
        onclick_val = link_tag.get("onclick", "")
        
        # IFWPopup('/program/E/ProgE0011S.aspx?...') 형태에서 URL만 파싱
        if "IFWPopup(" in onclick_val:
            start = onclick_val.find("('") + 2
            end = onclick_val.find("'", start)
            inner_url = onclick_val[start:end]
            link_url = "https://navi.inje.ac.kr" + inner_url

    print("Link :", link_url)

    #facil
    facil_tag = li.select_one("span.facil")

    facil_text = facil_tag.get_text("",strip=True)
    print("Facil : ", facil_text)


    #title
    title_tag = li.select_one("span.txt")

    title_text = title_tag.get_text("",strip=True)
    print("Title : ",title_text)

    #date
    date_tag = li.select_one("span.date")

    if date_tag:
        date_main = date_tag.get_text("",strip=True)

        time_tag = date_tag.select_one("b")
        time_text = time_tag.get_text(strip = True) if time_tag else ""

        # "신청 : "이라는 접두사 제거 (혹시 있을 경우만)
        date_main = date_main.replace("신청 :", "").replace("신청:", "").strip()

        # 최종 문자열: "2025.06.23 ~ 2025.07.09 13:00"
        date_text = date_main.replace(time_text, "").strip() + " " + time_text

    # 날짜 파싱 처리
    if " ~ " in date_text:
        # " ~ " 기준으로 시작일과 마감일 분리
        start_date, end_date = date_text.split(" ~ ")
        start_date = start_date.replace(".", "-")             # "2025-06-23"
        end_date = end_date.replace(".", "-", 2)              # "2025-07-09 13:00"


        print("start_date:", start_date)
        print("end_date  :", end_date)
    else:
        print("날짜 형식이 예상과 다릅니다:", date_text)

    #D-Day
    day_tag = li.select_one("span.d-day")
    day_text = day_tag.get_text("",strip=True) if day_tag else ""
    d_day =  int(day_text.replace("D-", "")) if "D-" in day_text else 9999

    #img
    img_tag = li.select_one("img")
    img_src = None 
    
    if img_tag and img_tag.get("src"):
        img_src = img_tag["src"]
        
        if img_src.startswith("/"):
            img_src = "https://navi.inje.ac.kr"+img_src
        else :
            print("img 없음")
        
    print("Img_url : ",img_src)
    print("-" *50)

    # 필수 데이터 체크
    if not all([title_text, start_date, end_date, link_url, facil_text]):
        print("⚠️ 필수 데이터 누락 → 건너뜀")
        continue

    programs.append({
        'title': title_text,
        'start_date': start_date,
        'end_date': end_date,
        'link': link_url,
        'img': img_src,
        'facil': facil_text,
        'd_day' : d_day
    })

delete_expired_programs()

programs.sort(key=lambda p: p['d_day'])


for p in programs[:10] :
    try:
        insert_programs(
        p['title'], p['start_date'], p['end_date'],
        p['link'], p['img'], p['facil']
    )
    except Exception as e:
            print("삽입 중 오류 발생",e)


cur.close()
conn.close()