import {useAuth} from "../contexts/AuthContext.jsx";
import styles from "../styles/WeMoveShared.module.css";
import {useEffect, useState} from "react";
import {createComment, deleteComment, getComments} from "../api/commentApi.js";
import defaultUserImage from "../assets/image/Default-user.png"

export default function Comment({meetingId, hostUserId, comments, setComments}) {
    const {user, isAuthenticated} = useAuth();
    const [content, setContent] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);//대댓글 달 부모댓글의 id
    const [replyContent, setReplyContent] = useState("");


    //1.댓글목록조회
    const fetchComments = () => {
        getComments(meetingId).then((res) => {
            console.log(res)
            setComments(res.data);
        }).catch((err) => {
            console.error("댓글불러오기 실패: ", err);
        })
    }
    useEffect(() => {
        if (meetingId) {
            fetchComments();
        }
    }, [meetingId]);

    //2.댓글 등록
    const handleCommentSubmit = (e) => {
        e.preventDefault();

        console.log("현재 로그인한 유저 아이디: ", user)
        console.log("유저 아이디 : ", user?.memberId)
        if (!content.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        const commentData = {
            writerId: user?.memberId,
            content: content,
            parentCommentId: null
        }
        createComment(meetingId, commentData).then((res) => {
            console.log(res);
            setContent(""); // 입력창 초기화
            fetchComments(); //목록새로고침
        }).catch((err) => {
            console.log(err);
            alert("댓글 등록에 실패했습니다.")
        })
    }
    //댓글 삭제
    const handleDeleteComment = (commentId) => {
        if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;
        deleteComment(commentId, user.memberId)
            .then(() => {
                alert("댓글이 삭제되었습니다.");
                fetchComments();
            })
            .catch((err) => {
                console.error("댓글 삭제 실패: ", err);
                alert("삭제 권한이 없거나 오류가 발생했습니다.");
            });
    }
    //대댓글 등록
    const handleReplySubmit = (e, parentCommentId) => {
        e.preventDefault();

        if (!replyContent.trim()) {
            alert("답글 내용을 입력해주세요.")
            return;
        }
        const commentData = {
            writerId: user?.memberId,
            content: replyContent,
            parentCommentId: parentCommentId,
        }
        createComment(meetingId, commentData).then((res) => {
            console.log(res.data);
            setReplyContent("");
            setReplyingTo(null);
            fetchComments();
        }).catch((err) => {
            console.log(err);
            alert("답글 등록에 실패했습니다.")
        })
    }
    const parentComments = comments.filter(c => !c.parentCommentId);

    return (
        <>
            <div className={styles.commentList}>

                {comments.length === 0 ? (
                    <p>아직 작성된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ) : (
                    parentComments.map((comment) => {

                        // 권한 체크: 작성자 본인이거나 모임 주최자일 때만 삭제 가능
                        const isAuthor = Number(user?.memberId) === Number(comment.writerId);
                        const isHost = Number(user?.memberId) === Number(hostUserId);
                        const canDelete = isAuthor || isHost;
                        const childComments = comments.filter(c => c.parentCommentId === comment.commentId);

                        return (
                            <div key={comment.commentId} className={styles.commentGroup}>

                                {/* 💡 1. 부모 댓글 영역 시작 */}
                                <article className={styles.commentItem}>
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
                                        <button onClick={() => {
                                            if (!isAuthenticated) return alert("로그인이 필요합니다.");
                                            setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId);
                                        }}>
                                            {replyingTo === comment.commentId ? "답글 취소" : "답글 달기"}
                                        </button>

                                        {canDelete && (
                                            <div className={styles.buttonWrap}>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteComment(comment.commentId)}
                                                >
                                                    댓글 삭제
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                                {/* 💡 부모 댓글 영역 끝! (여기서 article을 닫아줘야 레이아웃이 안 깨집니다) */}

                                {/* 💡 2. 대댓글 입력 폼 (article 밖에 위치해야 함) */}
                                {replyingTo === comment.commentId && (
                                    <div className={styles.replyIndentBox}>
                                        <form onSubmit={(e) => handleReplySubmit(e, comment.commentId)}>
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="답글을 입력하세요."
                                        />
                                            <button type="submit">등록</button>
                                        </form>
                                    </div>
                                )}

                                {/* 💡 3. 대댓글 목록 (article 밖에 위치해야 함) */}
                                {childComments.length > 0 && (
                                    <div className={styles.replyIndentBox}>
                                        {childComments.map((child) => {
                                            const isChildAuthor = Number(user?.memberId) === Number(child.writerId);
                                            const isChildHost = Number(user?.memberId) === Number(hostUserId);
                                            const canChildDelete = isChildAuthor || isChildHost;

                                            return(
                                                <article key={child.commentId} className={`${styles.commentItem} ${styles.childCommentBox}`}>
                                                    <img
                                                        /* 💡 수정: comment.profileImage -> child.profileImage 로 변경 */
                                                        style={!child.profileImage ? {
                                                            padding: "2px",
                                                            backgroundColor: "#f3f4f6",
                                                            boxSizing: "border-box",
                                                        } : {}}
                                                        src={child.profileImage || defaultUserImage}
                                                        alt={`${child.nickname} 프로필`}
                                                        className={styles.commentAvatar}
                                                    />
                                                    <div>
                                                        <div className={styles.commentMeta}>
                                                            {/* 💡 수정: comment.nickname -> child.nickname 사용 (이미 잘 하셨음!) */}
                                                            <strong>{child.nickname}</strong>
                                                            <span>{new Date(child.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        <p>{child.content}</p>

                                                        {canChildDelete && (
                                                            <div className={styles.buttonWrap}>
                                                                <button
                                                                    className={styles.deleteBtn}
                                                                    onClick={() => handleDeleteComment(child.commentId)}
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* 💡 수정: 여기에 있던 '답글 달기/취소' 버튼 삭제 완료! (대대댓글 방지) */}
                                                    </div>
                                                </article>
                                            )
                                        })}
                                    </div>
                                )}

                            </div> // 💡 commentGroup의 끝
                        );
                    })
                )}
            </div>

            {/* 메인 댓글 작성 폼 */}
            {isAuthenticated ? (
                <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="모임장에게 궁금한 점이나 참여 전에 확인하고 싶은 내용을 남겨보세요."/>
                    <div className={styles.formActions}>
                        <button type="submit">
                            댓글 등록
                        </button>
                    </div>
                </form>
            ) : (
                <p style={{color: "#666", marginBottom: "20px"}}>댓글을 작성하려면 로그인이 필요합니다.</p>
            )}
        </>
    )
}