import {useAuth} from "../contexts/AuthContext.jsx";
import styles from "../styles/WeMoveShared.module.css";
import {useEffect, useState} from "react";
import {createComment, deleteComment, getComments} from "../api/commentApi.js";
import defaultUserImage from "../assets/image/Default-user.png"
export default function Comment({meetingId, hostUserId, comments, setComments}) {
    const { user,isAuthenticated } = useAuth();
    const [content, setContent] = useState("");


    //1.댓글목록조회
    const fetchComments = ()=>{
        getComments(meetingId).then((res)=>{
            console.log(res)
            setComments(res.data);
        }).catch((err)=>{
            console.error("댓글불러오기 실패: ",err);
        })
    }
    useEffect(()=>{
        if(meetingId){
            fetchComments();
        }
    },[meetingId]);

    //2.댓글 등록
    const handleCommentSubmit = (e) => {
        e.preventDefault();

        console.log("현재 로그인한 유저 아이디: ", user)
        console.log("유저 아이디 : ", user?.memberId)
        if(!content.trim()){
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        const commentData = {
            writerId: user?.memberId,
            content: content,
            parentCommentId: null
        }
        createComment(meetingId, commentData).then((res)=>{
            console.log(res);
            setContent(""); // 입력창 초기화
            fetchComments(); //목록새로고침
        }).catch((err)=>{
            console.log(err);
            alert("댓글 등록에 실패했습니다.")
        })
    }
    //댓글 삭제
    const handleDeleteComment = (commentId) => {
        if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;
        console.log("🚀 [프론트엔드] 서버로 보낼 commentId:", commentId);
        console.log("🚀 [프론트엔드] 서버로 보낼 requesterId:", user?.memberId);

        // user.memberId를 넘겨 백엔드에서 권한 검증 수행
        deleteComment(commentId, user.memberId)
            .then(() => {
                alert("댓글이 삭제되었습니다.");
                fetchComments(); // 목록 새로고침
            })
            .catch((err) => {
                console.error("댓글 삭제 실패: ", err);
                alert("삭제 권한이 없거나 오류가 발생했습니다.");
            });
    }




    return(
        <>
            <div className={styles.commentList}>

                {comments.length === 0 ? (
                    <p>아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ) : (
                    comments.map((comment) => { // ★ 1. 소괄호 ( 가 아니라 중괄호 { 로 열어야 합니다.

                        // 권한 체크: 작성자 본인이거나 모임 주최자일 때만 삭제 가능
                        const isAuthor = Number(user?.memberId) === Number(comment.writerId);
                        const isHost = Number(user?.memberId) === Number(hostUserId);
                        const canDelete = isAuthor || isHost;

                        return ( // ★ 2. return 안에 화면에 그릴 article 태그를 묶어줍니다.
                            <article key={comment.commentId} className={styles.commentItem}>
                                <img
                                    style={!comment.profileImage ? {
                                        padding: "2px",
                                        backgroundColor: "#f3f4f6",
                                        boxSizing: "border-box",
                                    } : {}}
                                    src={comment.profileImage || defaultUserImage}
                                    alt={`${comment.nickname} 프로필`}
                                    className={styles.commentAvatar}
                                />
                                <div>
                                    <div className={styles.commentMeta}>
                                        <strong>{comment.nickname}</strong>
                                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p>{comment.content}</p>

                                    {/* ★ 3. canDelete가 true일 때만 삭제 버튼이 보이도록 감싸줍니다. */}
                                    {canDelete && (
                                        <div className={styles.buttonWrap}>
                                            <button
                                                className={styles.deleteBtn}
                                                // ★ 4. 화살표 함수를 써서 해당 댓글의 ID를 넘겨줘야 합니다.
                                                onClick={() => handleDeleteComment(comment.commentId)}
                                            >
                                                댓글 삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ); // ★ return 닫기
                    }) // ★ map 중괄호 닫기
                )}
            </div>

            {isAuthenticated ? (
                <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="모임장에게 궁금한 점이나 참여 전에 확인하고 싶은 내용을 남겨보세요." />
                    <div className={styles.formActions}>
                        <button type="submit">
                            댓글 등록
                        </button>
                    </div>
                </form>
            ) : (
                <p style={{ color: "#666", marginBottom: "20px" }}>댓글을 작성하려면 로그인이 필요합니다.</p>
            )}
        </>
    )
}