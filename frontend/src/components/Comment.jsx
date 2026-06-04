import {useAuth} from "../contexts/AuthContext.jsx";
import styles from "../styles/WeMoveShared.module.css";
import {useEffect, useState} from "react";
import {createComment, getComments} from "../api/commentApi.js";
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




    return(
        <>
            <div className={styles.commentList}>

                {comments.length === 0 ? (
                    <p>아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ):(

                    comments.map((comment)=>(
                        <article key={comment.commentId} className={styles.commentItem}>
                            <img
                                style={!comment.profileImage ? {
                                    padding: "2px",
                                    backgroundColor: "#f3f4f6",
                                    boxSizing: "border-box",
                                }:{}}
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
                                </div>
                        </article>
                    )))}


            </div>
            {isAuthenticated ? (
                <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="모임장에게 궁금한 점이나 참여 전에 확인하고 싶은 내용을 남겨보세요."/>
                    <div className={styles.formActions}>
                        <button
                            type="submit"
                        >댓글 등록
                        </button>
                    </div>
                </form>
            ):(
                <p style={{ color: "#666", marginBottom: "20px" }}>댓글을 작성하려면 로그인이 필요합니다.</p>
            )}


        </>
    )
}